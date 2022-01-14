from bs4 import BeautifulSoup
import os
#import chromedriver_autoinstaller #chromedriver_autoinstaller 0.2.24
#chromedriver_autoinstaller.install()
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

"""
Source code for the USYD wam calculator.
Manually traverses site with selenium.
I tried the requests library, but the Sydney Student URL querystring was encrypted.
If you know of a better way to do this (there probably is), please enlighten me.

-Daniel
"""

class MarkParsingException(Exception):
    pass

class LoginFailureException(Exception):
    pass

def getmymarks(username, password):

    """
    Instantiating webdriver
    """

    options = Options()
    #comment out below for local
    options.binary_location = os.environ.get('GOOGLE_CHROME_BIN')

    options.add_argument("--window-size=1920,1080")
    options.add_argument("--start-maximized")
    options.add_argument("--log-level=3")
    options.add_argument("--incognito")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")
    options.add_argument('--disable-gpu')
    options.add_argument('--headless')

    #comment out path for local
    driver = webdriver.Chrome(executable_path=str(os.environ.get('CHROMEDRIVER_PATH')), options=options)

    """
    Attempting login
    """
    try:
        driver.get("https://sydneystudent.sydney.edu.au/sitsvision/wrd/siw_lgn");
        driver.find_element_by_name('MUA_CODE.DUMMY.MENSYS.1').send_keys(username)
        driver.find_element_by_name('PASSWORD.DUMMY.MENSYS.1').send_keys(password)
        del username
        del password
        driver.find_element_by_name('BP101.DUMMY_B.MENSYS').click()
        driver.find_element_by_xpath("//a[contains(text(),'My Studies ')]").click()
        driver.find_element_by_id('ASSTUPOR01').click()

        course = driver.find_element_by_xpath("//a[contains(text(), 'View your academic transcript for')]")
        #print(course.text[34:])
        course.click()
    except:
        driver.quit()
        raise LoginFailureException

    """
    Navigating to results page and parsing html
    """
    try:
        coursetabletext = (driver.find_elements_by_class_name("sv-panel-primary")[3].find_element_by_tag_name("tbody")).text
        coursetabletext = coursetabletext[:coursetabletext.rfind('\n')]

        coursetable = (driver.find_elements_by_class_name("sv-panel-primary")[3].find_elements_by_tag_name("tr"))
        courselist = ([[i.text for i in j.find_elements_by_tag_name("td")] for j in coursetable[1:-1]])

        CP_tot = sum([float(i[6]) if not (i[4].isspace() or i[6].isspace()) else 0 for i in courselist])
        MARK_tot = sum([float(i[4])*float(i[6]) if not (i[4].isspace() or i[6].isspace()) else 0 for i in courselist])

        WAM = str(round(MARK_tot/CP_tot, 2))
    except:
        driver.quit()
        raise MarkParsingException

    driver.quit()
    return(coursetabletext, WAM)


if __name__ == "__main__":
    try:
        courses, wam = getmymarks("My own login details","used to be here")
        print(courses)
        print(wam)
    except LoginFailureException:
        print("Failed during login. Check credentials.")
    except MarkParsingException:
        print("Failed during mark parsing.")

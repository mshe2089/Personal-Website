from bs4 import BeautifulSoup #beautifulsoup4 2.2.1
import os
#import chromedriver_autoinstaller #chromedriver_autoinstaller 0.2.24
#chromedriver_autoinstaller.install()
from selenium import webdriver #selenium 1.26.6
from selenium.webdriver.chrome.options import Options

class MarkParsingException(Exception):
    pass

class LoginFailureException(Exception):
    pass

def getmymarks(username, password):

    print("logging in to Sydney Student...")

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
    #BeautifulSoup(driver.find_element_by_id('course-details').text, 'html.parser')
    return(coursetabletext, WAM)


if __name__ == "__main__":
    try:
        courses, wam = getmymarks("mshe2089","wtfdetwtfdwj")
        print(courses)
        print(wam)
    except LoginFailureException:
        print("Failed during login. Check credentials.")
    except MarkParsingException:
        print("Failed during mark parsing.")

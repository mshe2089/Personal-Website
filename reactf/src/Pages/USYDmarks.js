import loadgif from '../Assets/loading.gif';
import Button from 'react-bootstrap/Button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { tomorrowNight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';
import React, { useState, useEffect } from "react";
import './Fonts.css';
import './USYDmarks.css';

function USYDmarks() {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [hideunits, setHideunits] = useState('true'); 
  const [hidewam, setHidewam] = useState('true'); 
  const [loading, setLoading] = useState('true');
  const [source, setSource] = useState('');
  const [units, setUnits] = useState('');
  const [wam, setWam] = useState('');

  useEffect(() => { //Runs only on the first render
    fetch(`/api/USYDmarks_source`,{  //Passing as query string
        'methods':'GET',
        headers : {
          'Content-Type':'application/json',
        }
      })
      .then(response => response.json())
      .then(response => setSource(response.source))
      .catch(error => console.log(error))
  }, []);

  const handleUsername = (event) => {
    setUsername(event.target.value);
  };
  const handlePassword = (event) => {
    setPassword(event.target.value);
  };

  const submitCredentials = () => {
    setHideunits('true');
    setHidewam('true');
    setLoading('')
    fetch(`/api/USYDmarks_script`,{ 
        'methods':'GET',
        headers : {
          'Content-Type':'application/json',
          'username':encodeURIComponent(username),
          'password':encodeURIComponent(password),
        }
      })
      .then(response => {
        if(!response.ok){
          setWam("Error. Check your credentials?"); 
          setLoading('true');
          setHidewam('');
          throw new Error(response.status);
        }
        return response
      })
      .then(response => response.json())
      .then(response => {setUnits(response.units); return response})
      .then(response => {setWam(response.results); return response})
      .then(() => {
        setLoading('true')
        setHideunits('')
        setHidewam('')
      })
      .catch(error => console.log(error))
  };
  
  return ( 
    <div className="content">
        <h1 className ="title"> USYD wam calculator </h1>

        <div className ="entry">
            <p className ="paragraph">
                <br/>
                This tool will calculate your overall course wam at USYD, using all previous units for which results are published. <br/>
                The formula used is: 
            </p>
            <TeX className="formula" math="\frac{\sum_{}^{} (UOS\_mark \times UOS\_CP)}{\sum_{}^{} (UOS\_CP)}" block />
            <p className ="paragraph">
                I swear, swear, swear, by the moon and the stars in the sky, cross my heart and hope to die, so help me god, that <b>this won't record any of your private information. </b>
                It needs your login credentials to log into Sydney Student and access your records. 
                Full source code is attached, but if you're still apprehensive, feel free to refrain from using this tool.<br/>
                Results are for reference only. I accept no responsibility. Please use your better judgement when using any information obtained from this tool.<br/>
                <br/>
            </p>

            <div>
                <form name="loginform">
                    <input type="text" id="usernamebox" size="40" placeholder="unikey" value ={username} onChange={handleUsername} disabled={!loading}/><br/>
                    <input type="password" id="passwordbox" size="40" placeholder="password" value ={password} onChange={handlePassword} disabled={!loading}/>
                    <Button variant="dark" id="getmarks" onClick={submitCredentials} disabled={!loading}> <span hidden={!loading}>Get WAM</span> <img hidden={loading} src={loadgif} height="24px" width="24px" alt="..."/></Button><br/>
                </form>
            </div>
        </div>

        <div className="entry" hidden={hideunits}>
            <hr className ="divider"/>
            <div id="units">{units}</div>
        </div>

        <div className="entry" hidden={hidewam}>
            <hr className ="divider"/>
            <div id="wam"><b>{wam}</b></div>
        </div>

        <hr className ="divider"/>

        <div className ="entry" id="USYDmarkssrc">
          <SyntaxHighlighter language="python" style={tomorrowNight} showLineNumbers="true">
            {source}
          </SyntaxHighlighter>
        </div>

        <hr className ="divider"/>

        <div className ="entry">
            <p className  = "disclaimer">
                Report bugs and submit suggestions via email.
            </p>
        </div>
    </div>

    
  );
}

export default USYDmarks;

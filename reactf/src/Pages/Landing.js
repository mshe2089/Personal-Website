import './Fonts.css';
import './Landing.css';

function Landing() {
  return ( 
    <div className ="content">
        <h1 className ="title"> Welcome. </h1>
        <br/>

        <div className ="entry">
        <b className ="subtitle">About me</b>
        <p className ="paragraph">
            <br/>Muqing, or Daniel. Undergraduate student at the University of Sydney, studying <strong>mechatronic engineering and computer science</strong>. Graduating in Dec 2024. Looking for an internship.
            <br/>
            <br/> Thanks for visiting.
            <br/>
        </p>
        </div>

        <hr className ="divider"/>

        <div className ="entry">
        <br/>
        <b className ="subtitle">About this site</b>
        <p className ="paragraph">
            <br/>I intended this website for showcasing interesting stuff or just silly experiments.
            <br/>
            <br/>Unfortunately in its current state its very shady... I'm working on getting it properly domain registered.
            <br/>
            <br/>Look around and see if you find anything useful. If you have any suggestions feel free to email me.
            <br/>
            <br/>This site is dynamic for no good reason, and self hosted on a Raspberry Pi 4B.
            <br/>
        </p>
        </div>

        <hr className ="divider"/>
    </div>
  );
}

export default Landing;

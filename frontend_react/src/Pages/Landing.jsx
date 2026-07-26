import PageTemplate from '../Components/Common/PageTemplate';
import PixelCanvas from '../Components/Common/PixelCanvas';
import Callout from '../Components/Common/Callout';

function Landing() {
  return (
    <PageTemplate title="Welcome" date="Oct 2023">
      <div className="mb-xl">
        <Callout emoji="💡">
          Use the bar on the left to browse the site directory.
        </Callout>
      </div>

      <section className="mb-2xl">
        <h2 className="article-subtitle mt-0">About me</h2>
        <p className="text-body">
          I'm Daniel. Thanks for visiting!
        </p>
      </section>

      <img
        src="https://media.tenor.com/giNrzT0tQGsAAAAj/bonfire-dark-souls.gif"
        alt="Dark Souls bonfire"
        className="mx-auto mb-xl block h-auto w-48 border-0"
      />

      <section className="mb-2xl">
        <h2 className="article-subtitle">About this site</h2>
        <p className="text-body">
          I intended this website for showcasing interesting stuff or just silly experiments.
          However, it's very much still a work in progress.
          Look around and see if you find anything useful. If you have any suggestions, I'd love to hear them.
        </p>
      </section>

      <section className="mb-2xl">
        <h2 className="article-subtitle">Cost of running this site</h2>
        <p className="text-body">
          About 40 AUD/year for the <code className="font-mono bg-secondary px-1 py-0.5 rounded text-primary">muqing.dev</code> domain, plus unspecified amount in electricity bills for my old dell laptop running the backend.
        </p>
      </section>
      
      <section className="mb-2xl">
        <h2 className="article-subtitle">Signature Board</h2>
        Since you're already here, why not leave a signature? Please respect others.
        <PixelCanvas name="signatures" width={256} height={128} />
      </section>

    </PageTemplate>
  );
}

export default Landing;

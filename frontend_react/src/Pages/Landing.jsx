import PageTemplate from '../Components/Common/PageTemplate';

function Landing() {
  return (
    <PageTemplate title="Welcome" date="Oct 2023">
      <div className="mb-md">
        <b className="section-label">About me</b>
        <p className="text-body">
          Muqing, or Daniel, code farmer. Currently, I'm looking for an identity for this site. Thanks for visiting!
        </p>
      </div>

      <hr className="border-0 border-t border-default my-xl" />

      <div className="mb-md">
        <b className="section-label">About this site</b>
        <p className="text-body">
          I intended this website for showcasing interesting stuff or just silly experiments.
          However, it's very much still a work in progress.
          Look around and see if you find anything useful. If you have any suggestions, I'd love to hear them.
        </p>
      </div>

      <hr className="border-0 border-t border-default my-xl" />

      <div className="mb-md">
        <b className="section-label">Cost of running this site</b>
        <p className="text-body">
          About 40 AUD/year for the <code className="font-mono bg-secondary px-1 py-0.5 rounded text-primary">muqing.dev</code> domain, plus unspecified amount in electricity bills for my old dell inspiron running the backend.
        </p>
      </div>
    </PageTemplate>
  );
}

export default Landing;

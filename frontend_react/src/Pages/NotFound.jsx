import { Link } from 'react-router-dom';
import PageTemplate from '../Components/Common/PageTemplate';

function NotFound() {
  return (
    <PageTemplate title="Page not found">
      <p className="text-body mb-md">
        The requested page is not part of the current site.
      </p>
      <Link to="/" className="text-primary underline hover:text-secondary">
        Return home
      </Link>
    </PageTemplate>
  );
}

export default NotFound;

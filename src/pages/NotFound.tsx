import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-surface">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-text-primary">404</h1>
        <p className="mb-4 text-xl text-text-secondary">Oops! Page not found</p>
        <Link to="/">
          <button className="text-primary underline hover:text-primary-glow transition-colors">
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

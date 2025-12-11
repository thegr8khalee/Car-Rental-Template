// Breadcrumbs.jsx
import { Link } from "react-router-dom";
import { useBreadcrumbs } from './BreadCrumbContext';

export default function Breadcrumbs() {
  const history = useBreadcrumbs();

  return (
    <nav className="text-sm text-gray-600 mb-4">
      <ol className="flex space-x-2">
        {history.map((item, idx) => (
          <li key={idx} className="flex items-center">
            <Link
              to={item.pathname}
              className="hover:underline text-primary"
            >
              {item.label}
            </Link>
            {idx < history.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

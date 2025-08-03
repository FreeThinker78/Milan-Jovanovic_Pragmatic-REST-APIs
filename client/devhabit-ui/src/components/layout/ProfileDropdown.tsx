import { Link, useNavigate } from 'react-router-dom';
import { HiUser, HiCog8Tooth, HiArrowRightOnRectangle } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

const ProfileDropdown = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
      <Link
        to="/profile"
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
      >
        <HiUser className="w-4 h-4" />
        Profile
      </Link>

      <Link
        to="/settings"
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
      >
        <HiCog8Tooth className="w-4 h-4" />
        Settings
      </Link>

      <hr className="my-1 border-gray-200" />

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full"
      >
        <HiArrowRightOnRectangle className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
};

export default ProfileDropdown;

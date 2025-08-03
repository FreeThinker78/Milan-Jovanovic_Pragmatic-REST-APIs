import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiBars3, HiBell, HiChevronDown } from 'react-icons/hi2';
import ProfileDropdown from './ProfileDropdown';
import { HiCode } from 'react-icons/hi';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg">
            <HiBars3 className="w-6 h-6" />
          </button>

          <Link to="/" className="ml-4 text-xl font-bold flex items-center">
            <HiCode className="inline-block w-6 h-6 mr-2" /> DevHabit
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <HiBell className="w-6 h-6" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <img src="/default-avatar.webp" alt="Profile" className="w-8 h-8 rounded-full" />
              <HiChevronDown className="w-4 h-4" />
            </button>

            {isProfileOpen && <ProfileDropdown />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

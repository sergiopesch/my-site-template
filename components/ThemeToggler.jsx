'use client';
import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from 'next-themes';

const ThemeToggler = () => {
    const { theme, setTheme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // Function to toggle theme
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <div>
            {theme === 'light' ?
                <MoonIcon onClick={toggleTheme} style={{ cursor: 'pointer' }} />
                :
                <SunIcon onClick={toggleTheme} style={{ cursor: 'pointer' }} />
            }
        </div>
    );
};

export default ThemeToggler;

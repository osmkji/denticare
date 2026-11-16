import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                surface: '#f8fafc',
                primary: {
                    DEFAULT: '#0f4c5c',
                    dark: '#0a3540',
                    light: '#16697a',
                    subtle: '#eaf4f6',
                },
                accent: {
                    DEFAULT: '#2a9d8f',
                    hover: '#21867a',
                    light: '#e8f6f4',
                    dark: '#1c6d64',
                },
            },
        },
    },

    plugins: [forms],
};

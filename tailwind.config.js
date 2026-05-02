/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme:{
        extend: {
            colors: {
                primary: '#ff6a00',
                "primary-dark": '#e85f00',
            },
        },
    },
    plugins: [],
};
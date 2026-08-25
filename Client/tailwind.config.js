/** @type {import('tailwindcss').Config} */
export default {

  content: [

    "./index.html",

    "./src/**/*.{js,jsx,ts,tsx}",

  ],

  theme: {

    extend: {

      colors: {

        primary: "#4169E1",

        navy: "#000080",

        accent: "#87CEEB",

        background: "#FFFFFF",

      },

      fontFamily: {

        sans: ["Poppins", "sans-serif"],

      },

      boxShadow: {

        card: "0 10px 30px rgba(65,105,225,0.15)",

      },

    },

  },

  plugins: [],

}
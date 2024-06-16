/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend:{
      colors: {
/*         'txtlight': '#010104',
        'txtdark': '#fbfbfe',
        'blight': '#fbfbfe',
        'bdark': '#010104',
        'prim': '#26cf91',
        'seclight': '#c7ffeb',
        'secdark': '#3dffb8',
        'accent': '#3dffb8',*/
        'cancel': 'rgb(234 88 12)',
        'warning': '#FFC107',
        'graybg' : 'rgb(246, 247, 249)',
        gray: {
          '1': "rgb(246, 247, 249)"
        }
       }
    }
  },
  plugins: []
}


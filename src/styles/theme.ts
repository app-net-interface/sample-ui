// Theme configuration
export const commonStyles = {
  container: 'rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1',
  title: 'text-xl font-semibold text-black dark:text-white',
  subtitle: 'text-base font-medium',
  
  // Input styles
  input: 'w-full rounded-lg border border-stroke bg-transparent py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary',
  
  // Modern Table styles with 3D effect
  table: {
    container: `
      w-full rounded-lg border border-gray-200/50 
      bg-white shadow-lg 
      dark:border-gray-700 dark:bg-boxdark
      backdrop-blur-sm backdrop-filter
      overflow-hidden
      transform perspective-1000
    `,
    header: `
      grid grid-cols-7 gap-3
      bg-gradient-to-b from-gray-50 to-white
      dark:from-gray-800 dark:to-gray-900
      py-4 px-6
      sticky top-0 z-10
      border-b border-gray-200/75 dark:border-gray-700/75
      shadow-sm
    `,
    cell: `
      flex items-center justify-center
      px-4 py-3
      text-sm font-medium text-gray-700 dark:text-gray-200
      transition-colors duration-200
    `,
    row: {
      base: `
        grid grid-cols-7 gap-3
        border-b border-gray-100 dark:border-gray-800
        transition-all duration-200 ease-in-out
      `,
      selected: `
        bg-blue-50/50 dark:bg-blue-900/20
        transform translate-x-1
        shadow-md
      `,
      normal: 'bg-white dark:bg-boxdark',
      hover: `
        hover:bg-gray-50/75 dark:hover:bg-gray-800/50
        hover:shadow-md
        hover:transform hover:translate-x-1
        cursor-pointer
        transition-all duration-200
      `
    }
  },

  // State styles
  states: {
    empty: 'text-center text-gray-500 dark:text-gray-400',
    loading: 'text-center text-gray-500 dark:text-gray-400',
    error: 'text-center text-red-500'
  }
};

// Utility function to combine multiple class strings
export const combineStyles = (...classes: string[]) => {
  return classes.filter(Boolean).join(' ');
};

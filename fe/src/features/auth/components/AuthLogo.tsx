import React from "react";

export function AuthLogo() {
  return (
    <div className='flex items-center gap-3'>
      <div
        className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white'
        aria-hidden='true'
      >
        <svg
          width='22'
          height='22'
          viewBox='0 0 24 24'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M5 13.5C6.5 9.8 10.6 7 15 7C17.2 7 19.1 7.6 20.5 8.5C18.2 8.2 16.1 9 14.7 10.3C13 11.9 12.1 14.4 12.4 17.1C11.1 16.5 9.8 15.6 8.7 14.3C7.6 13.1 6.4 12.7 5 13.5Z'
            stroke='#4F46E5'
            strokeWidth='2'
            strokeLinejoin='round'
          />
          <path
            d='M4.5 18.5C6.5 17.8 8.6 18.1 10.3 19.1'
            stroke='#4F46E5'
            strokeWidth='2'
            strokeLinecap='round'
          />
        </svg>
      </div>

      <div className='leading-tight'>
        <div className='text-[28px] font-extrabold tracking-tight text-black'>
          JobTrack<span className='text-[#4F46E5]'>r</span>
        </div>
      </div>
    </div>
  );
}

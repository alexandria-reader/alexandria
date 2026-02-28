import { Navigate } from 'react-router';
import { useAtomValue } from 'jotai';
import { userState } from '../states/recoil-states';

import Hero from './home/Hero';
import HowItWorks from './home/HowItWorks';
import FAQ from './home/FAQ';

export default function Home() {
  const user = useAtomValue(userState);

  return (
    // <div className='home-page'>
    <>
      {!user ? (
        <>
          <Hero />
          <HowItWorks />
          <FAQ />
        </>
      ) : (
        <Navigate to="/texts" />
      )}{' '}
    </>
    // </div>
  );
}

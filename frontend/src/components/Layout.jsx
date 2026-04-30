import { useEffect } from 'react';
import Header from './shared/Header';
import Footer from './shared/Footer';
import Modal from './Modal';
import { useAppSelector } from '../hooks/useAppSelector';
import PropTypes from 'prop-types';

const Layout = ({ noFooter, component }) => {
  const modalShown = useAppSelector((state) => state.modal.visible);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#09091e]">
        <Header />
        <main className="pt-16">{component}</main>
        {!noFooter && <Footer />}
      </div>
      {modalShown && <Modal />}
    </>
  );
};

Layout.propTypes = {
  noFooter: PropTypes.bool,
  component: PropTypes.element.isRequired,
};

export default Layout;

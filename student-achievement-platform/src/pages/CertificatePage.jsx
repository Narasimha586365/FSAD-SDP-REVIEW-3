import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAppContext } from '../context/AppContext';
import '../styles/CertificatePage.css';

const CertificatePage = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { currentUser, certificateList, fetchJson, refreshPlatformData } = useAppContext();
  const [resolvedCertificate, setResolvedCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const certificate = useMemo(
    () => resolvedCertificate || certificateList.find((item) => String(item.id) === String(certificateId)),
    [certificateId, certificateList, resolvedCertificate]
  );

  useEffect(() => {
    let ignore = false;

    const loadCertificate = async () => {
      setIsLoading(true);
      try {
        const latestCertificates = await fetchJson('/certificates/me');
        const matchedCertificate = (latestCertificates || []).find((item) => String(item.id) === String(certificateId));
        if (!ignore) {
          setResolvedCertificate(matchedCertificate || null);
          await refreshPlatformData();
        }
      } catch (error) {
        if (!ignore) {
          setResolvedCertificate(null);
          Swal.fire('Certificate unavailable', error.message || 'Unable to load certificate details.', 'error');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    if (certificate) {
      setIsLoading(false);
      return () => {
        ignore = true;
      };
    }

    loadCertificate();

    return () => {
      ignore = true;
    };
  }, [certificate, certificateId, fetchJson, refreshPlatformData]);

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:8080/certificate/download?certificateId=${certificateId}`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      });
      if (!response.ok) {
        throw new Error('Unable to open certificate');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = certificate?.fileName || 'certificate.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Swal.fire('Download failed', error.message || 'Unable to download certificate.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="certificate-page">
        <div className="certificate-page__card">
          <h1 className="certificate-page__title">Loading Certificate</h1>
          <p className="certificate-page__subtitle">Fetching your latest certificate details...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="certificate-page">
        <div className="certificate-page__card">
          <h1 className="certificate-page__title">Certificate Not Found</h1>
          <p className="certificate-page__subtitle">The certificate details are not available right now.</p>
          <button className="certificate-page__back" onClick={() => navigate('/participation')}>
            Back to My Participants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="certificate-page">
      <div className="certificate-page__card">
        <div
          className={`certificate-page__status ${certificate?.resultLabel === 'PASSED' ? 'certificate-page__status--passed' : 'certificate-page__status--failed'}`}
        >
          {certificate?.resultLabel || 'CERTIFICATE'}
        </div>
        <h1 className="certificate-page__title">Assessment Certificate</h1>
        <p className="certificate-page__subtitle">Issued from the Student Achievement Platform</p>
        <h2 className="certificate-page__name">{certificate?.achievementTitle || certificate?.moduleName}</h2>
        <p>{certificate?.categoryName} - {certificate?.domainName}</p>
        <p className="certificate-page__meta">Score: {certificate?.score}%</p>
        <p className="certificate-page__meta">Issued Date: {certificate?.issuedDate}</p>

        <button onClick={handleDownload} className="certificate-page__download">
          Download Certificate PDF
        </button>
        <br />
        <button onClick={() => navigate('/participation')} className="certificate-page__back">
          Back to My Participants
        </button>
      </div>
    </div>
  );
};

export default CertificatePage;

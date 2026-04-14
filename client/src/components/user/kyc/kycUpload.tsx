import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { uploadKYC, fetchKYCStatus, clearKYCError, clearKYCSuccess } from '@/store/features/user/kycSlice';

const KYCUpload: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, loading, uploadLoading, error, success } = useAppSelector(state => state.kyc);
  
  const [formData, setFormData] = useState({
    nin: '',
    idCard: null as File | null,
    selfie: null as File | null,
  });

  useEffect(() => {
    dispatch(fetchKYCStatus());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      // Clear form and show success message
      setFormData({ nin: '', idCard: null, selfie: null });
      setTimeout(() => {
        dispatch(clearKYCSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nin || !formData.idCard || !formData.selfie) {
      alert('Please fill all fields and select both files');
      return;
    }

    try {
      await dispatch(uploadKYC({
        nin: formData.nin,
        idCard: formData.idCard,
        selfie: formData.selfie,
      })).unwrap();
    } catch (error) {
      console.error('KYC upload failed:', error);
    }
  };

  if (loading) {
    return <div>Loading KYC status...</div>;
  }

  if (data?.kycStatus === 'VERIFIED') {
    return (
      <div className="kyc-verified">
        <h2>✅ KYC Verified</h2>
        <p>Your identity has been successfully verified.</p>
      </div>
    );
  }

  return (
    <div className="kyc-upload">
      <h2>KYC Document Upload</h2>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => dispatch(clearKYCError())}>×</button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          KYC documents uploaded successfully! Your documents are under review.
        </div>
      )}

      {data?.kycStatus === 'PENDING' && data.identity.hasDocuments ? (
        <div className="kyc-pending">
          <h3>📋 Documents Under Review</h3>
          <p>Your KYC documents have been submitted and are currently being reviewed.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="kyc-form">
          <div className="form-group">
            <label htmlFor="nin">National Identification Number (NIN):</label>
            <input
              type="text"
              id="nin"
              name="nin"
              value={formData.nin}
              onChange={handleInputChange}
              maxLength={11}
              placeholder="Enter your 11-digit NIN"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="idCard">ID Card Photo:</label>
            <input
              type="file"
              id="idCard"
              name="idCard"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="selfie">Selfie Photo:</label>
            <input
              type="file"
              id="selfie"
              name="selfie"
              onChange={handleFileChange}
              accept="image/*"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={uploadLoading}
            className="submit-button"
          >
            {uploadLoading ? 'Uploading...' : 'Upload KYC Documents'}
          </button>
        </form>
      )}
    </div>
  );
};

export default KYCUpload;
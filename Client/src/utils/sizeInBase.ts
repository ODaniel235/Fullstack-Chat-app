const getBase64Size = (base64String) => {
  const base64Length = base64String.length;
  const padding = (base64String.match(/=/g) || []).length; // Count '='
  const sizeInBytes = (base64Length * 3) / 4 - padding;
  const sizeInKB = sizeInBytes / 1024;
  const sizeInMB = sizeInKB / 1024;

  return {
    sizeInBytes,
    sizeInKB: sizeInKB.toFixed(2),
    sizeInMB: sizeInMB.toFixed(2),
  };
};

export default getBase64Size;

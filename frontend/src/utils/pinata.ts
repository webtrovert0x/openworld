export const uploadToPinata = async (file: File) => {
  try {
    const data = new FormData();
    data.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: data,
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error?.details || "Failed to upload file to Pinata");
    
    return `ipfs://${resData.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading file to Pinata:", error);
    throw error;
  }
};

export const uploadMetadataToPinata = async (name: string, description: string, imageIpfsUri: string) => {
  try {
    const data = JSON.stringify({
      pinataContent: {
        name,
        description,
        image: imageIpfsUri,
      },
      pinataMetadata: {
        name: `${name}_metadata.json`,
      },
    });

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: data,
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error?.details || "Failed to upload metadata to Pinata");

    return `ipfs://${resData.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    throw error;
  }
};

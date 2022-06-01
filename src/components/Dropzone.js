import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import "../styles/Previewdropzone.css";

const PreviewDropzone = (props) => {
  const [files, setFiles] = useState([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );

      props.onCapture(acceptedFiles[0]);
    },
  });

  const thumbs = files.map((file) => (
    <div key={file.name}>
      <img
        src={file.preview}
        // Revoke data uri after image is loaded
        onLoad={() => {
          URL.revokeObjectURL(file.preview);
        }}
        alt="img"
        className="preview rounded"
      />
    </div>
  ));

  const clearImageHandler = () => {
    setFiles([]);
  };

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  return (
    <section className="dropzoneContainer shadow py-5 px-2">
      <aside>{thumbs}</aside>
      {files.length === 0 && (
        <div {...getRootProps({ className: "dropzone" })}>
          <input {...getInputProps()} name="itemImage" />
          <p>Drop Image here</p>
        </div>
      )}
      {files.length !== 0 && (
        <button
          className="py-1 px-5 mt-5 bg-gray-200 rounded shadow font-medium text-black"
          onClick={clearImageHandler}
        >
          Clear image
        </button>
      )}
    </section>
  );
};

export default PreviewDropzone;

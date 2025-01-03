"use client";
import React, { useState, useCallback, useEffect } from "react";
import styles from "@/styles/auth.module.css";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {  useAppSelector } from "@/redux/store";


interface S3UrlObject {
  filekey: string;
  signedUrl: string;
}

const Page = () => {

  const auth = useAppSelector((state) => state.authReducer);
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = () => {
    setFile(null);
  };

  const viewFile = () => {
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, "_blank");
    }
  };

  const [uploading, setUploading] = useState<boolean>(false);
  const router = useRouter();

  const generatePostObjectUrl = async (): Promise<S3UrlObject | null> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/file/generatepostobjecturl`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    const data = await res.json();
    if (data.ok) {
      console.log(data.data.signedUrl);
      return data.data;
    } else {
      toast.error("Failed to generate post object URL");
      return null;
    }
  };

  const uploadToS3ByUrl = async (url: string): Promise<boolean> => {
    if (!file) return false;
    setUploading(true);
    const options = {
      method: "PUT",
      body: file,
    };

    const res = await fetch(url, options);
    setUploading(false);
    return res.ok;
  };

  const handleUpload = async () => {
    if (!file || !email || !fileName) {
      toast.error("Please fill all fields and upload a file");
      return;
    }

    setUploading(true);

    const s3urlobj = await generatePostObjectUrl();
    if (!s3urlobj) {
      setUploading(false);
      return;
    }

    const { filekey, signedUrl } = s3urlobj;

    const uploaded = await uploadToS3ByUrl(signedUrl);
    if (!uploaded) {
      setUploading(false);
      toast.error("Failed to upload file to S3");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file/sharefile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        receiveremail: email,
        filename: fileName,
        filekey,
        fileType: file.type,
      }),
    });

    const data = await res.json();
    setUploading(false);

    if (data.ok) {
      toast.success("File shared successfully");
      router.push("/myfiles");
    } else {
      toast.error("Failed to share file");
    }
  };

  useEffect(() => {
    console.log(auth.isAuth);
    if (!auth.isAuth) {
      router.push("/login");
    }
  }, [auth, router]);

  return (
    <div className={styles.authpage}>
      <div className={styles.authcontainer}>
        <div className={styles.inputcontaner}>
          <label htmlFor="email">Receiver&apos;s email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={styles.inputcontaner}>
          <label htmlFor="filename">File Name</label>
          <input
            type="text"
            name="filename"
            id="filename"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </div>

        <div className={styles.inputcontaner}>
          {file ? (
            <div className={styles.filecard}>
              <div className={styles.left}>
                <p>{file.name}</p>
                <p>{(file.size / 1024).toFixed(2)} KB</p>
              </div>

              <div className={styles.right}>
                <svg
                  onClick={removeFile}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>

                <svg
                  onClick={viewFile}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div className={styles.dropzone} {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <div className={styles.droptext}>
                  <p>Drag &apos;n&apos; drop some files here</p>
                  <p>or</p>
                  <p>click here to select files</p>
                </div>
              )}
            </div>
          )}
        </div>

        <button className={styles.button1} type="button" onClick={handleUpload}>
          Send
        </button>
      </div>

      {uploading && (
        <div className={styles.uploadpopup}>
          <p>Uploading...</p>
        </div>
      )}
    </div>
  );
};

export default Page;

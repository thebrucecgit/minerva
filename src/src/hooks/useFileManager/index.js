import { useEffect, useState, useRef } from "react";
import { useApolloClient } from "@apollo/client";
import { loader } from "graphql.macro";
import { nanoid } from "nanoid";
import axios from "axios";

const PRESIGNED_URL = loader("./PresignedUrl.gql");

export default function useFileManager({
  edit = false,
  files: processedFiles = [],
  setFiles,
}) {
  const client = useApolloClient();
  const [processingFiles, setProcessingFiles] = useState([]);
  const processingFilesRef = useRef([]);

  useEffect(() => {
    processingFilesRef.current = processingFiles;
  }, [processingFiles]);

  useEffect(() => {
    return () => {
      processingFilesRef.current.forEach((f) => f.abort());
    };
  }, [edit]);

  async function process(file) {
    const controller = new AbortController();

    const fileId = nanoid(); // temporary, before being overwritten by server id

    setProcessingFiles((files) => [
      ...files,
      {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        processing: true,
        abort() {
          // expose an abort method so the request can be cancelled
          controller.abort();
          setProcessingFiles((files) => files.filter((f) => f.id !== fileId));
        },
        progress: {
          loadedComputable: false,
        },
      },
    ]);

    const { data } = await client.query({
      query: PRESIGNED_URL,
      variables: {
        fileName: file.name,
      },
    });

    await axios({
      method: "put",
      url: data.getUploadUrl,
      signal: controller.signal,
      data: file,
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress(e) {
        setProcessingFiles((files) => {
          const newFiles = [...files];
          newFiles.find((f) => f.id === fileId).progress = e;
          return newFiles;
        });
      },
    });

    setFiles((files) => [
      {
        id: new URL(data.getUploadUrl).pathname.slice(1),
        name: file.name,
        size: file.size,
        type: file.type,
      },
      ...files,
    ]);
    setProcessingFiles((files) => files.filter((f) => f.id !== fileId));
  }

  function remove(fileId) {
    setFiles((files) => files.filter((f) => f.id !== fileId));
  }

  return {
    processing: processingFiles.length > 0,
    fileManagerProps: {
      edit,
      files: [...processingFiles, ...processedFiles],
      process,
      remove,
    },
  };
}

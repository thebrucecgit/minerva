import { useState } from "react";
import styled from "styled-components";
import { FileIcon, defaultStyles } from "react-file-icon";
import { useDropzone } from "react-dropzone";
import prettyBytes from "pretty-bytes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faTimes } from "@fortawesome/free-solid-svg-icons";

const StyledDropzone = styled.div`
  padding: 0.5rem 1rem;
  background-color: #eee;
  border-radius: 5px;
`;

const DragPrompt = styled.p`
  text-align: center;
  color: #444;
  padding: 1rem 0;
`;

const Icon = styled.div`
  width: 2rem;
  margin-right: 10px;
`;

const StyledFile = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 0.8rem;
  background-color: #444;
  color: whitesmoke;
  border-radius: 5px;
  p {
    margin: 0;
  }
`;

const Errors = styled.div`
  color: red;
`;

const FileSize = styled.p`
  font-size: 0.8rem;
  color: #ccc;
`;

const RightOfFile = styled.div`
  margin-left: auto;
`;

const DeleteButton = styled.div`
  cursor: pointer;
  background-color: #666;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 200ms;
  &:hover {
    background-color: #111;
  }
`;

export default function FileManager({
  edit = false,
  // below are internal props from `useFileManager` hook
  files,
  process,
  remove,
  ...options // passed to dropzone
}) {
  const [errors, setErrors] = useState([]);

  function onDrop(accepted, rejected) {
    accepted.forEach(process);
    setErrors(
      rejected.map(
        (reject) =>
          `${reject.file.name}: ${reject.errors
            .map((error) => error.message)
            .join(", ")}`
      )
    );
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...options,
    onDrop,
  });

  const rootProps = edit ? getRootProps() : {};

  return (
    <StyledDropzone {...rootProps}>
      {edit && (
        <>
          <input {...getInputProps()} />
          <DragPrompt>
            {isDragActive
              ? "Drop file here..."
              : "Drag and drop files here, or click to browse"}
          </DragPrompt>
          <Errors>
            {errors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </Errors>
        </>
      )}
      {files.map((file) => (
        <StyledFile key={file.id}>
          <Icon>
            <FileIcon
              extension={file.name.split(".").pop()}
              {...defaultStyles[file.name.split(".").pop()]}
            />
          </Icon>
          <div>
            <a href={file.link} target="_blank" rel="noreferrer">
              {file.name}
            </a>
            <FileSize>{prettyBytes(file.size)}</FileSize>
          </div>
          <RightOfFile>
            {file.processing &&
              (file.progress.lengthComputable ? (
                <p>
                  {Math.round(
                    (file.progress.loaded / file.progress.total) * 100
                  )}
                  %
                </p>
              ) : (
                <FontAwesomeIcon icon={faCircleNotch} spin />
              ))}
            {edit && (
              <DeleteButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (file.processing) file.abort();
                  else remove(file.id);
                }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </DeleteButton>
            )}
          </RightOfFile>
        </StyledFile>
      ))}
    </StyledDropzone>
  );
}

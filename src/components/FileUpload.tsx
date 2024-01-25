"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { checkSubscription } from "@/lib/subscription";

// https://github.com/aws/aws-sdk-js-v3/issues/4126

// this will receive the number of created chats for the day, and check if its smaller than 1 or if the user is pro. If any of these
// are acceppted then the user can upload a new file.

type Props = {
  numberChatsDay: number | undefined;
  isPro: boolean;
};

const FileUpload = ({ numberChatsDay, isPro }: Props) => {
  const router = useRouter();
  console.log(numberChatsDay);
  const [uploading, setUploading] = React.useState(false);
  const { mutate } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // bigger than 10mb!
        toast.error("File too large");
        return;
      }
      if (numberChatsDay !== undefined) {
        if (
          (!isPro && numberChatsDay >= 1) ||
          (isPro && numberChatsDay >= 20)
        ) {
          toast.error("You have reached the daily upload limit.");
          return;
        }
      }

      try {
        setUploading(true);
        const data = await uploadToS3(file);
        console.log("meow", data);
        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong");
          return;
        }
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            toast.error("Error creating chat");
            console.error(err);
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className: `border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col ${
            uploading ? "opacity-50" : "" // Add opacity when uploading
          }`,
          // Add the disabled attribute based on the uploading state
          disabled: uploading,
        })}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            {/* loading state */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Enviando informações para o ChatGPT
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">PDF</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

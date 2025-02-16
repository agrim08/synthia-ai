import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TabsContent } from "@radix-ui/react-tabs";
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const FileReference = ({ filesReferences }: Props) => {
  const [tab, setTab] = useState(filesReferences[0]?.fileName);

  if (filesReferences.length === 0) return null;

  return (
    <div className="w-full max-w-full lg:max-w-[90vw] xl:max-w-[80vw]">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent flex gap-2 overflow-x-auto rounded-md bg-gray-700 p-1">
          {filesReferences.map((file) => (
            <Button
              key={file.fileName}
              className={cn(
                `flex-shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted ${
                  tab === file.fileName
                    ? "bg-primary text-white"
                    : "text-white/80"
                }`,
              )}
              onClick={() => setTab(file.fileName)}
            >
              {file.fileName}
            </Button>
          ))}
        </div>
        <div className="mt-2 w-full">
          {filesReferences.map((file) => (
            <TabsContent
              value={file.fileName}
              key={file.fileName}
              className="max-h-[60vh] w-full overflow-auto rounded-md"
            >
              <div className="relative w-full">
                <SyntaxHighlighter
                  language="typescript"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.375rem",
                    fontSize: "0.875rem",
                  }}
                  wrapLongLines={true}
                >
                  {file.sourceCode}
                </SyntaxHighlighter>
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default FileReference;

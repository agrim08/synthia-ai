import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TabsContent } from "@radix-ui/react-tabs";
import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { lucario } from "react-syntax-highlighter/dist/esm/styles/prism";

type Props = {
  filesReferences: { fileName: string; sourceCode: string; summary: string }[];
};

const FileReference = ({ filesReferences }: Props) => {
  const [tab, setTab] = useState(filesReferences[0]?.fileName);

  if (filesReferences.length === 0) return;
  return (
    <div className="max-w-[60vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex gap-2 overflow-scroll rounded-md bg-gray-700 p-1">
          {filesReferences.map((file) => (
            <Button
              key={file.fileName}
              className={cn(
                `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted ${
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
        {filesReferences.map((file) => (
          <TabsContent
            value={file.fileName}
            key={file.fileName}
            className="max-h-[40vh] max-w-7xl overflow-scroll rounded-md"
          >
            <SyntaxHighlighter language="typescript" style={lucario}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FileReference;

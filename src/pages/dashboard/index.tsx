"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { FileList } from "@/components/dashboard/file-list";
// import { ChatContainer } from "@/components/dashboard/chat-container";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function Dashboard() {
  

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Admin Dashboard"
        text="Upload, manage files, and test with the bot."
      />
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="files">View Files</TabsTrigger>
          <TabsTrigger value="chat">Chat Bot</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="space-y-4">
        
        </TabsContent>
        {/* <TabsContent value="files" className="space-y-4">
          <FileList files={uploadedFiles} />
        </TabsContent>
        <TabsContent value="chat" className="space-y-4">
          <ChatContainer files={uploadedFiles} />
        </TabsContent> */}
      </Tabs>
    </DashboardShell>
  );
}

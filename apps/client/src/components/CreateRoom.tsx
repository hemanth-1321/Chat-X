"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessagesSquare } from 'lucide-react';
import { useState } from 'react';
import { CreateChatDialog } from '@/components/Chat-dialogbox';
import { useRouter } from 'next/navigation';

export function CreateRoom() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [slug, setSlug] = useState('');
  const router = useRouter();

  const handleJoinRoom = () => {
    if (slug) {
      router.push(`/Arena/${slug}`);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="rounded-full bg-primary/10 p-6 mb-4">
        <MessagesSquare size={48} className="text-primary" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Welcome to ChatX</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Start a new conversation or join an existing room to begin chatting.
      </p>

      <Button className="mb-4" onClick={() => setIsCreateDialogOpen(true)}>
        Start a new chat
      </Button>
      <CreateChatDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      {/* Join Room Input and Button */}
      <div className="flex w-full max-w-md justify-center items-center space-x-2 mt-2">
        <Input
          placeholder="Enter room slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <Button className='cursor-pointer' variant="outline" onClick={handleJoinRoom}>
          Join
        </Button>
      </div>

      {/* Feature Boxes */}
      <div className="mt-16 max-w-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="bg-card/30 backdrop-blur-sm border border-border/40 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Create an account</h3>
            <p className="text-sm text-muted-foreground">Sign up to unlock all features and start chatting with others.</p>
          </div>
          <div className="bg-card/30 backdrop-blur-sm border border-border/40 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Personalize your profile</h3>
            <p className="text-sm text-muted-foreground">Set a custom avatar and status to make yourself recognizable.</p>
          </div>
          <div className="bg-card/30 backdrop-blur-sm border border-border/40 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Start conversations</h3>
            <p className="text-sm text-muted-foreground">Create one-on-one or group chats with your contacts.</p>
          </div>
          <div className="bg-card/30 backdrop-blur-sm border border-border/40 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Share with anyone</h3>
            <p className="text-sm text-muted-foreground">Exchange messages and stay connected with your network.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

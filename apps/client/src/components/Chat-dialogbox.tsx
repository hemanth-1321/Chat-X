import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { BACKENDURL } from '@/lib/config';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  chatName: z.string().min(1, 'Chat room name is required'),
});
const token = localStorage.getItem("token");
 
type FormValues = z.infer<typeof formSchema>;

interface CreateChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChatDialog({ open, onOpenChange }: CreateChatDialogProps) {
  const router=useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      chatName: '',
    },
  });

  const onSubmit =async (values: FormValues) => {
 const res= await axios.post(`${BACKENDURL}/chat/room`,{
    
    name:values.chatName,
    
  },{
    headers:{
        Authorization:token
    }
  })
  const slug=values.chatName
  if(res.status===201){
     toast.success("Room Created")
    router.push(`/Arena/${slug}`)
  }else{
    toast.warning("Room couldnt be Created")
  }
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/80 backdrop-blur-xl border-border/40 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat Room</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="chatName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter chat room name"
                      {...field}
                      className="bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Room</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
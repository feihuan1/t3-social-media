"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import { usePathname, useRouter } from "next/navigation";

// import { updateUser } from "@/lib/actions/user.action";
import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.actions";
// import { createThread } from "@/lib/actions/thread.actions";


interface Props {
    threadId: string,
    currentUserImg: string,
    currentUserId: string,

}


const Comment = ({threadId, currentUserImg, currentUserId}: Props) => {
    const router = useRouter()
    const pathname = usePathname()
  
    const form = useForm({
      resolver: zodResolver(CommentValidation),
      defaultValues: {
       thread: ''
      },
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread(threadId, values.thread, JSON.parse(currentUserId), pathname)

       form.reset()
    }
  return (
    <Form {...form}>
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="comment-form"
    >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full items-center gap-3">
              <FormLabel className="rounded-full overflow-hidden !w-12 !h-12 " >
                <Image src={currentUserImg} alt='Profile image' width={48} height={48} className="object-contain "  />
              </FormLabel>
              <FormControl className="border-none bg-transparent">
                <Input 
                className="no-focus text-light-1 outline-none"
                  type="text"
                  placeholder="Comment..." 
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="comment-form_btn">
            Reply
        </Button>
    </form>
    </Form>
  )
}

export default Comment

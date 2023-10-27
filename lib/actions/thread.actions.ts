"use server"

import { connectToDB } from "../mongoose"
import Thread from "../models/thread.model"
import User from "../models/user.model"
import { revalidatePath } from "next/cache";

interface Params {
    text: string, 
    author: string, 
    communityId: string | null, 
    path: string
}


export async function createThread({text, author, communityId, path}: Params){
   try {
    connectToDB();

    const createdThread = await Thread.create({
        text,
        author,
        community: null
    })

    // update user model
    await User.findByIdAndUpdate(author,{
        $push: { threads: createdThread._id }
    })

    // makesure the change happens immediatly
    revalidatePath(path)
   } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`)
   }
   
}

export async function fetchPosts(pageNumber=1, pageSize=20){
        connectToDB();

        //calculate how many post to skip in different page
        const skipAmount = (pageNumber - 1) * pageSize

        //fetch post have no parent(top-level, not commemts)
        const postQuery = Thread.find({ parentId: { $in: [null, undefined] } })
        .sort({ createdAt: 'desc' })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: 'author', model: User })
        .populate({ 
            path: 'children',
            populate: { 
                path: 'author',
                model: User,
                select: '_id name parentId image'
            } 
        })

        const totalPostCount = await Thread.countDocuments({parentId: { $in: [null, undefined] }})

        const posts = await postQuery.exec()

        const isNext = totalPostCount > skipAmount + posts.length

        return { posts, isNext }
    }


    // multi level comment model
export async function fetchThreadById(id: string) {
    connectToDB();
    try {
        //todo: populate community
        const thread = await Thread.findById(id)
            .populate({
                path: 'author',
                model: User, 
                select: "_id id name image"
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path:'author',
                        model: User, 
                        select: "_id id name parentId image"
                    }, 
                    {
                        path: 'children',
                        model: Thread,
                        populate:{
                            path: 'author',
                            model: User,
                            select: "_id id name parentId image"
                        }
                    }
                ]
                // excute it by exec()
            }).exec()

            return thread
    } catch (error: any) {
        throw new Error(`Error fething thread: ${error.message}`)
    }
}

export async function addCommentToThread(
    threadId: string,
    commentText: string,
    userId: string, 
    path: string
) {
    connectToDB();
    try {
        //add a comment
        // find the thread need comment by its id
        const originalThread = await Thread.findById(threadId)
        if(!originalThread) {
            throw new Error('no such thread')
        }

        //create new thread(comment) with the text input
        const commentThread = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId
        })

        // save the comment to db
        const savedCommentThread = await commentThread.save()

        // update the original thread to include the comment
        originalThread.children.push(savedCommentThread._id)

        //save the original thread
        await originalThread.save()

        // like refresh page, change shows instantlly
        revalidatePath(path)

    } catch (error: any) {
        throw new Error(`Error adding comment to thread: ${error.message}`)
    }
}
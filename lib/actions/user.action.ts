"use server";

import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
  userId: string,
  username: string,
  name: string,
  bio: string,
  image: string,
  path: string
}

    // passing object as params avoid errors on wrong order
export async function updateUser(
 { 
  userId,
  username,
  name,
  bio,
  image,
  path
}: Params): Promise<void> {
  connectToDB();

 try {
    await User.findOneAndUpdate(
        { id: userId },
        { 
            username: username.toLowerCase(), 
            name, 
            bio, 
            image, 
            onboarded: true 
        },
        {
            upsert: true
        }
      );
    
        if(path === '/profile/edit') {
            revalidatePath(path)
        }
 } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`)
 }

}

export async function fetchUser(userId: string) {
  try {
    connectToDB()

    return await User
                  .findOne({ id: userId })
                  // .populate({
                  //   path: 'communities', 
                  //   model: Community
                  // })
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
}

 export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();
    //find all threads written by user with the id pass in

    //todo: populate community
    const threads = await User.findOne({ id: userId })
      .populate({
        path: 'threads',
        model: Thread, 
        populate: {
            path: 'children',
            model: Thread, 
            populate: {
              path: 'author', 
              model: 'User', 
              select: 'name image id'
            }
        }
      })

      return threads

  } catch (error: any) {
    throw new Error(`Failed to fetch posts: ${error.message}`)

  }
 }

 export async function fetchUsers({ 
    userId, 
    searchString='',
    pageNumber = 1, 
    pageSize = 20, 
    sortBy = 'desc'
  }: {
    userId: string, 
    searchString? : string,
    pageNumber?: number, 
    pageSize?: number, 
    sortBy?: SortOrder
  }) {
      try {
        connectToDB();

        // calculate number of user to skip base of the page number and page size
        const skipAmount = (pageNumber - 1) * pageSize

        // case sensitive filter
        const regex = new RegExp(searchString, 'i') 

        const query: FilterQuery<typeof User> = {
          // $ne: not equal to
          id: { $ne: userId }
        }

        if(searchString.trim() !== '') {
            query.$or = [
              { username: { $regex: regex } },
              { name: { $regex: regex } }
            ]
        }

        const sortOptions = { createdAt: sortBy };

        const userQuery = User.find(query)
          .sort(sortOptions)
          .skip(skipAmount)
          .limit(pageSize)
        
        const totalUsersCount = await User.countDocuments(query)

        const users = await userQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext }

      } catch (error: any) {
        throw new Error(`Failed to fetch all users: ${error.message}`)
      }
 }

 export async function getActivity(userId: string) {
    try {
      connectToDB() 

      // find all threads created by the user
      const userThreads = await Thread.find({ author: userId })

      //collect all child thread id(comments) from 'Children' field

      const childThreaIds = userThreads.reduce((acc, userThread) => {
        return acc.concat(userThread.children)
      },[])

      const replies = await Thread.find({
        _id: { $in: childThreaIds },
        author: { $ne: userId },
      }).populate({
        path: 'author', 
        model: User, 
        select: 'name image _id'
      })

      return replies

    } catch (error: any) {
      throw new Error(`Failed to get activities: ${error.message}`)
    }
 }
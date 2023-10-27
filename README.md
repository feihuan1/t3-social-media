# tools
1. @clerk/nextjs: simple authetication
2. uploadthing and uploadthing/react: upload profile image
3. mongoose: mongodb
4. svix: for web hooks


# notes
1. implement authetication with clerk, create auth folderand signin signup page, create middleware.ts in root, add keys and after signin derections in .env.local
2. create topbar leftbar rightbar and bottom bar, leftbar shows on large screen, buttom bar instead in mobile, add dark theme to clerk organization in top bar, right bar only shows if theres space
3. onbording page using shadcn, need install shad and different components, use zod to resolve schemas, render profile image from clerk need modify next.config.js, add images obj into nextConfig, also add 'mongoose' as serverComponentExternalPackages
4. use react-hook-form and uploadthing to upload profile img, make api/uploadthing/core.ts & route.ts copy from uploading doc , replace demo auth with currentuser from clerk
5. create backend action function in lib folder,create connect to mongodb, call it in user action, define user models schema in userModel 
6. create updateuser and fetchUser in lib user.action for future use
7. create fetchPost for home page, returns all post and isNext to define is there next page
8. create home page render thread card, fetch all threads and display with card
9. create thread page dynamicly, create fetchThreadById funtion to get single tread and call it in the page
10. build search page, call fetchUsers(not fetchUser) in backend at lib/action display depends on user query, click on user push router profile page
11. build activity page to notify user when they have a reply, creat getActivity function in backend to get all comments in User
12. add webhook listen to web events, add community page,
13. fix mongo alta error by adding ip address
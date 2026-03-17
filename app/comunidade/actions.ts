"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type Post = {
  id: string
  user_id: string
  content: string
  image_url: string | null
  beach_name: string | null
  likes_count: number
  comments_count: number
  created_at: string
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
  user_has_liked?: boolean
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  } | null
}

export async function getPosts(): Promise<Post[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get posts without join
  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching posts:", error)
    return []
  }

  if (!posts || posts.length === 0) {
    return []
  }

  // Get unique user IDs
  const userIds = [...new Set(posts.map(p => p.user_id))]
  
  // Fetch profiles separately
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds)

  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

  // Check if current user has liked each post
  let likedPostIds = new Set<string>()
  if (user) {
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", user.id)

    likedPostIds = new Set(likes?.map(l => l.post_id) || [])
  }

  return posts.map(post => ({
    ...post,
    profiles: profilesMap.get(post.user_id) || null,
    user_has_liked: likedPostIds.has(post.id)
  }))
}

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Voce precisa estar logado para publicar" }
  }

  const content = formData.get("content") as string
  const beachName = formData.get("beach_name") as string | null
  const imageUrl = formData.get("image_url") as string | null

  if (!content || content.trim().length === 0) {
    return { error: "O conteudo do post e obrigatorio" }
  }

  const { error } = await supabase
    .from("community_posts")
    .insert({
      user_id: user.id,
      content: content.trim(),
      beach_name: beachName || null,
      image_url: imageUrl || null,
    })

  if (error) {
    console.error("Error creating post:", error)
    return { error: "Erro ao criar post" }
  }

  revalidatePath("/comunidade")
  return { success: true }
}

export async function toggleLike(postId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Voce precisa estar logado para curtir" }
  }

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single()

  if (existingLike) {
    // Unlike
    await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id)

    // Update count
    await supabase.rpc("decrement_likes", { post_id: postId })
  } else {
    // Like
    await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: user.id })

    // Update count
    await supabase.rpc("increment_likes", { post_id: postId })
  }

  revalidatePath("/comunidade")
  return { success: true }
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Voce precisa estar logado para comentar" }
  }

  if (!content || content.trim().length === 0) {
    return { error: "O comentario nao pode estar vazio" }
  }

  const { error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    })

  if (error) {
    console.error("Error adding comment:", error)
    return { error: "Erro ao adicionar comentario" }
  }

  // Update comments count
  await supabase.rpc("increment_comments", { post_id: postId })

  revalidatePath("/comunidade")
  return { success: true }
}

export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient()
  
  // Get comments without join
  const { data: comments, error } = await supabase
    .from("post_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching comments:", error)
    return []
  }

  if (!comments || comments.length === 0) {
    return []
  }

  // Get unique user IDs
  const userIds = [...new Set(comments.map(c => c.user_id))]
  
  // Fetch profiles separately
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds)

  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

  return comments.map(comment => ({
    ...comment,
    profiles: profilesMap.get(comment.user_id) || null
  }))
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Voce precisa estar logado" }
  }

  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting post:", error)
    return { error: "Erro ao deletar post" }
  }

  revalidatePath("/comunidade")
  return { success: true }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return {
    id: user.id,
    email: user.email,
    ...profile
  }
}

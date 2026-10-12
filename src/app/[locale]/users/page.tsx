"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import { useAppDispatch, useAppSelector } from "@/src/store/hooks"
import {
  addImages,
  addUser,
  deleteImage,
  deleteUser,
  fetchUsers,
  toggleCompleted,
  ToDo,
  updateUser,
} from "@/src/store/userSlice"
import { apiImages } from "@/src/Api/Api"

export default function UsersPage() {
  const t = useTranslations("UsersPage")
  const dispatch = useAppDispatch()
  const { todos, loading, error } = useAppSelector((state) => state.users)

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const addFileRef = useRef<HTMLInputElement>(null)

  const [editing, setEditing] = useState<ToDo | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const [imageTarget, setImageTarget] = useState<ToDo | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const imageFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(addUser({ name, description, images: files })).unwrap()
      setName("")
      setDescription("")
      setFiles([])
      if (addFileRef.current) addFileRef.current.value = ""
      setAdding(false)
      await dispatch(fetchUsers())
    } catch {
      // error is stored in redux state
    }
  }

  const openEdit = (todo: ToDo) => {
    setEditing(todo)
    setEditName(todo.name)
    setEditDescription(todo.description)
  }

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    try {
      await dispatch(
        updateUser({ id: editing.id, name: editName, description: editDescription })
      ).unwrap()
      setEditing(null)
      await dispatch(fetchUsers())
    } catch {
      // error is stored in redux state
    }
  }

  const handleToggle = async (id: number) => {
    await dispatch(toggleCompleted(id))
    await dispatch(fetchUsers())
  }

  const handleDelete = async (id: number) => {
    await dispatch(deleteUser(id)).unwrap()
    await dispatch(fetchUsers())
  }

  const handleDeleteImage = async (imageId: number) => {
    await dispatch(deleteImage(imageId)).unwrap()
    await dispatch(fetchUsers())
  }

  const handleAddImages = async (e: FormEvent) => {
    e.preventDefault()
    if (!imageTarget || imageFiles.length === 0) return
    try {
      await dispatch(
        addImages({ id: imageTarget.id, images: imageFiles })
      ).unwrap()
      setImageTarget(null)
      setImageFiles([])
      if (imageFileRef.current) imageFileRef.current.value = ""
      await dispatch(fetchUsers())
    } catch {
      // error is stored in redux state
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          {t("add")}
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div>{t("loading")}</div>}

      {!loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="group flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{todo.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {todo.description}
                  </p>
                </div>
                <label className="flex shrink-0 items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={() => handleToggle(todo.id)}
                  />
                  {t("completed")}
                </label>
              </div>

              <div className="flex-1">
                {todo.images.length === 0 && (
                  <span className="text-sm text-gray-400">{t("noImages")}</span>
                )}
                <div className="flex flex-wrap gap-3">
                  {todo.images.map((image) => (
                    <div key={image.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${apiImages}${image.imageName}`}
                        alt={image.imageName}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs leading-none shadow"
                        aria-label="delete image"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                <Link
                  href={`/users/${todo.id}`}
                  className="px-3 py-1.5 border border-blue-500 text-blue-600 rounded-xl text-sm hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950/40"
                >
                  {t("info")}
                </Link>
                <button
                  type="button"
                  onClick={() => openEdit(todo)}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {t("edit")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageTarget(todo)
                    setImageFiles([])
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {t("addImage")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(todo.id)}
                  className="ml-auto px-3 py-1.5 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{t("newUser")}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleAdd}>
              <input
                className="border border-gray-300 rounded-xl p-2"
                type="text"
                placeholder={t("name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="border border-gray-300 rounded-xl p-2"
                type="text"
                placeholder={t("description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <input
                ref={addFileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100"
                  onClick={() => {
                    setAdding(false)
                    setName("")
                    setDescription("")
                    setFiles([])
                    if (addFileRef.current) addFileRef.current.value = ""
                  }}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  {t("add")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{t("editUser")}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleEdit}>
              <input
                className="border border-gray-300 rounded-xl p-2"
                type="text"
                placeholder={t("name")}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <input
                className="border border-gray-300 rounded-xl p-2"
                type="text"
                placeholder={t("description")}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100"
                  onClick={() => setEditing(null)}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {imageTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{t("addImageTitle")}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleAddImages}>
              <input
                ref={imageFileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100"
                  onClick={() => {
                    setImageTarget(null)
                    setImageFiles([])
                  }}
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

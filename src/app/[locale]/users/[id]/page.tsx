"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import { useAppDispatch, useAppSelector } from "@/src/store/hooks"
import {
  addImages,
  deleteImage,
  fetchUserById,
  toggleCompleted,
  updateUser,
} from "@/src/store/userSlice"
import { apiImages } from "@/src/Api/Api"

export default function UserInfoPage() {
  const t = useTranslations("UsersPage")
  const params = useParams()
  const id = Number(params?.id)
  const dispatch = useAppDispatch()
  const { currentTodo, loading, error } = useAppSelector((state) => state.users)

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  // Add image state
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id) {
      dispatch(fetchUserById(id))
    }
  }, [dispatch, id])

  const openEdit = () => {
    if (!currentTodo) return
    setEditName(currentTodo.name)
    setEditDescription(currentTodo.description)
    setIsEditing(true)
  }

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault()
    if (!currentTodo) return
    try {
      await dispatch(
        updateUser({ id: currentTodo.id, name: editName, description: editDescription })
      ).unwrap()
      setIsEditing(false)
      dispatch(fetchUserById(currentTodo.id))
    } catch {
      // error handled in redux
    }
  }

  const handleToggle = async () => {
    if (!currentTodo) return
    await dispatch(toggleCompleted(currentTodo.id))
    dispatch(fetchUserById(currentTodo.id))
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!currentTodo) return
    await dispatch(deleteImage(imageId)).unwrap()
    dispatch(fetchUserById(currentTodo.id))
  }

  const handleAddImage = async (e: FormEvent) => {
    e.preventDefault()
    if (!currentTodo || imageFiles.length === 0) return
    try {
      setIsUploadingImage(true)
      await dispatch(addImages({ id: currentTodo.id, images: imageFiles })).unwrap()
      setImageFiles([])
      if (imageInputRef.current) imageInputRef.current.value = ""
      dispatch(fetchUserById(currentTodo.id))
    } finally {
      setIsUploadingImage(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          ← {t("back")}
        </Link>
      </div>

      {loading && <div className="text-gray-500">{t("loading")}</div>}
      {error && <div className="mb-4 text-red-600">{error}</div>}

      {!loading && currentTodo && (
        <div className="flex flex-col gap-6">
          {/* Card Info Header */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{currentTodo.name}</h1>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    #{currentTodo.id}
                  </span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  {currentTodo.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openEdit}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {t("edit")}
                </button>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
                  <input
                    type="checkbox"
                    checked={currentTodo.isCompleted}
                    onChange={handleToggle}
                  />
                  <span>{t("completed")}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Add Image Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 text-lg font-semibold">{t("addImageTitle")}</h2>
            <form onSubmit={handleAddImage} className="flex flex-wrap items-center gap-3">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))}
                className="text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-800 dark:file:text-gray-200"
              />
              <button
                type="submit"
                disabled={imageFiles.length === 0 || isUploadingImage}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploadingImage ? t("loading") : t("addImage")}
              </button>
            </form>
          </div>

          {/* Images Gallery Section */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold">{t("images")} ({currentTodo.images.length})</h2>

            {currentTodo.images.length === 0 ? (
              <p className="text-sm text-gray-400">{t("noImages")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {currentTodo.images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${apiImages}${image.imageName}`}
                      alt={image.imageName}
                      className="h-44 w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-xs text-white shadow hover:bg-red-700"
                      title={t("delete")}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-bold">{t("editUser")}</h2>
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">{t("name")}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 p-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("description")}</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  required
                  className="w-full rounded-xl border border-gray-300 p-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
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

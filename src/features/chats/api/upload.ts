import { post } from '@/lib/api-client'

export interface UploadResponse {
    data: string[]
    message: string
}

/**
 * Upload multiple images
 * POST /api/files/multiple
 */
export async function uploadChatImages(files: File[]): Promise<string[]> {
    try {
        const formData = new FormData()

        // Append all files
        files.forEach((file) => {
            formData.append('files', file)
        })

        // Append type
        formData.append('type', 'chat')

        console.log('🔵 [uploadChatImages] Uploading files:', files.length)

        const { data } = await post<UploadResponse>('/files/multiple', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        console.log('✅ [uploadChatImages] Upload success:', data)

        // Backend returns {data: string[], message: string}
        const uploadResponse = data as UploadResponse
        return uploadResponse.data || []
    } catch (error) {
        console.error('❌ [uploadChatImages] Error:', error)
        throw error
    }
}

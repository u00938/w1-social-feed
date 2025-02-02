import { createRoute, z } from "hono_zod_openapi"
import { openApiJson } from "../utils.ts"
import { postingSchema } from "../schemas.ts"

export const allNumbersRegex = /^\d+$/
export const consecutiveRegex = (n: number) => new RegExp(String.raw`(\w)\1{${n - 1}}`)
const maxConsecutive = 3
const minPasswordLength = 10
const minDiversity = 2
export const wordRegex = /[a-zA-Z]/
export const numberRegex = /\d/
export const specialCharacterRegex = /[@$!%*?&#]/

const diversity = (x: string) =>
	[wordRegex, numberRegex, specialCharacterRegex]
		.filter((regex) => regex.test(x))

// 통상적으로 자주 사용되는 비밀번호는 사용할 수 없습니다.
// 다른 개인 정보와 유사한 비밀번호는 사용할 수 없습니다.
// 이전 비밀번호와 동일하게 설정할 수 없습니다.
export const passwordSchema = z.string()
	.min(minPasswordLength, { message: `비밀번호는 최소 ${minPasswordLength}자 이상이어야 합니다.` })
	.refine((x) => !allNumbersRegex.test(x), {
		message: "숫자로만 이루어진 비밀번호는 사용할 수 없습니다.",
	})
	.refine((x) => !consecutiveRegex(maxConsecutive).test(x), {
		message: `${maxConsecutive}회 이상 연속되는 문자 사용이 불가합니다.`,
	})
	.refine((x) => diversity(x).length >= minDiversity, {
		message: `문자, 숫자, 특수문자 중 ${minDiversity}가지 이상을 포함해야 합니다.`,
	})

export const signUpUser = createRoute({
	method: "post",
	path: "/auth/signup",
	tags: ["auth"],
	summary: "신규 회원가입을 요청합니다.",
	request: {
		body: {
			description: "회원가입 요청을 위한 정보를 입력합니다.",
			content: {
				"application/json": {
					schema: z.object({
						email: z.string().email().openapi({ example: "wanted@gmail.com" }),
						password: z.string().openapi({ example: "password123!" }),
						name: z.string().min(1).openapi({ example: "dani" }),
					}),
				},
			},
		},
	},
	responses: {
		400: {
			description: "요청이 잘못되었습니다.",
		},
	},
})

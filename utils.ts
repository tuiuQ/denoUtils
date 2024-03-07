import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

type CallbackFunction = (path: string) => void;

export default class Utils {
	/**
	 * 读取指定路径的JSON文件并返回解析后的JSON对象。
	 *
	 * @param path 文件路径
	 * @returns 解析后的JSON对象
	 * @throws 如果读取或解析文件出错，则抛出错误
	 */
	static async readJSON<T>(path: string): Promise<T> {
		const data = await Utils.readFile(path);
		return Utils.tryParseJSON<T>(data) as T;
	}

	/**
	 * 读取指定路径的文件内容。
	 *
	 * @param path 文件路径
	 * @returns 读取到的文件内容
	 * @throws 如果读取文件出错，则抛出错误
	 */
	static async readFile(path: string) {
		const decoder = new TextDecoder("utf-8");
		try {
			const data = await Deno.readFile(path);
			return decoder.decode(data);
		} catch (e) {
			throw new Error('read file error');
		}
	}

	/**
	 * 尝试将给定的字符串解析为JSON对象。
	 *
	 * @param jsonString 要解析的JSON字符串
	 * @returns 解析后的JSON对象，如果解析失败则返回undefined
	 * @throws 如果解析JSON出错，则抛出错误
	 */
	static tryParseJSON<T>(jsonString: string): T | undefined {
		try {
			return JSON.parse(jsonString) as T;
		} catch (e) {
			// 解析JSON出错时抛出错误
			throw new Error('parse json error');
		}
	}

	/**
	 * 将JSON对象或字符串写入指定路径的文件中
	 *
	 * @param path 文件路径
	 * @param json JSON对象或字符串
	 * @throws {Error} 写入文件出错时抛出异常，异常类型为Error
	 */
	static async writeJSON(path: string, json: object | string) {
		const encoder = new TextEncoder();

		// 如果 json 参数是对象类型
		if (typeof json === 'object') {
			// 使用 Deno 的 writeFile 方法将 json 对象转为字符串并写入指定路径的文件
			await Deno.writeFile(path, encoder.encode(JSON.stringify(json)));
			// 如果 json 参数是字符串类型
		} else if (typeof json === 'string') {
			// 直接使用 Deno 的 writeFile 方法将字符串写入指定路径的文件
			await Deno.writeFile(path, encoder.encode(json));
			// 如果 json 参数既不是对象类型也不是字符串类型，抛出错误：json 类型错误
		} else {
			throw new Error('json type error');
		}
	}

	static async writeFile(path: string, content: string) {
		const encoder = new TextEncoder();
		await Deno.writeFile(path, encoder.encode(content));
	}

	// 获取指定路经下的所有文件
	/**
	 * 获取指定路径下的所有文件（包括子目录）
	 *
	 * @param path 文件路径
	 * @param callback 回调函数，接收文件路径作为参数
	 * @param caller 调用者，可选
	 * @returns 无返回值
	 */
	static async getFiles<T>(path: string, callback: CallbackFunction, caller: T) {
		try {
			// 获取文件/目录状态
			const stat = await Deno.stat(path);
			// 如果是目录
			if (stat.isDirectory) {
				// 读取目录下的所有文件/子目录
				for await (const dirEntry of Deno.readDir(path)) {
					// 递归获取文件/子目录
					await Utils.getFiles<T>(join(path, dirEntry.name), callback, caller);
				}
				// 如果是文件
			} else if (stat.isFile) {
				// 调用回调函数处理文件
				callback.call(caller, path.replace(/\/\//g, "/"));
			}
		} catch (error) {
			// 读取路径出错，输出错误信息
			console.error(`Error reading path ${path}`, error);
		}
	}
}

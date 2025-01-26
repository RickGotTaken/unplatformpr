import { useEffect, useState, type HTMLAttributes, type ReactElement, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import type { LiteracyLevel } from "../content/config";
import { loadLiteracyLevel, saveLiteracyLevel } from "../lib";


export default function TechLiteracySelector(props: HTMLAttributes<HTMLFormElement>) {
	const { register, watch } = useForm<{ literacyLevel: LiteracyLevel }>({ defaultValues: { 
		literacyLevel: loadLiteracyLevel() ?? "0"
	} });

	const currentLevel = watch("literacyLevel");

	const literacyLevels: (string | ReactElement)[] = [
		"I can just barely operate a web browser.",
		"I know what a .zip file is, and what it's used for.",
		`I know what happens if I type "%appdata%" into Windows Explorer.`,
		"I've dabbled with HTML / CSS (or other programming / markup languages).",
		<a className="underline" target="_blank" href="https://www.youtube.com/watch?v=fBDifUjNzbQ">"I don't even see the code."</a>
	];

	useEffect(() => {
		saveLiteracyLevel(currentLevel);
	}, [currentLevel]);

	return (
		<form  {...props}>
			<fieldset className="ml-4">
				{literacyLevels.map((content, index) => (
					<div key={index} className="flex items-center gap-2">
						<input type="radio" id={index.toString()} {...register("literacyLevel")} value={index.toString()} />
						<label htmlFor={index.toString()}>{content}</label>
					</div>
				))}
			</fieldset>
		</form>

	);
}
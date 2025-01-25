import type { CollectionEntry } from "astro:content";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { FiMonitor } from "react-icons/fi";
import { toTitleCase } from "../lib/dom";
import { Cities, RecommendationCategories, type City, type LiteracyLevel, type RecommendationCategory } from "../types";
import { loadLiteracyLevel, saveLiteracyLevel } from "../lib";
import { useForm } from "react-hook-form";
import { PiCityFill } from "react-icons/pi";

export interface DatabaseViewOptions {
	freeOnly: boolean;
	category: RecommendationCategory;
	maxComplexity: LiteracyLevel;
	city: City;
}

export interface DatabaseViewProps {
	title: string;
	entries: CollectionEntry<"recommendations">[];
	defaultOptions?: Partial<DatabaseViewOptions>;
	hideOptions?: Record<keyof DatabaseViewOptions, boolean>;
}

export default function DatabaseView({ title, entries, defaultOptions, hideOptions }: DatabaseViewProps) {
	const { register, watch, reset } = useForm<DatabaseViewOptions>({
		defaultValues: {
			freeOnly: false,
			category: "all",
			maxComplexity: loadLiteracyLevel() ?? "4",
			city: "All",
			...defaultOptions
		}
	});

	const filters = watch();
	const resetFilters = useCallback(() => {
		reset({
			freeOnly: false,
			category: "all",
			maxComplexity: "4",
			city: "All"
		});
		saveLiteracyLevel("4");
	}, []);

	const filteredEntries = useMemo(() => {
		let result = entries;
		if (filters.freeOnly) {
			result = entries.filter(({ data }) => data.pricing.includes("free"))
		}

		if (filters.category !== "all") {
			result = entries.filter(({ data }) => data.category.includes(filters.category))
		}

		if (filters.maxComplexity !== "4") {
			const maxLevel = parseInt(filters.maxComplexity);
			result = entries.filter(({ data }) => parseInt(data.literacyLevel) <= maxLevel)
		}

		result = result.sort((a, b) => a.data.title.localeCompare(b.data.title));
		return result;
	}, [filters]);

	return (
		<section className="w-full rounded-md border border-textColor">
			<div className="p-4 border-b border-textColor w-full flex items-center gap-4">
				<h1 className="font-bold">{title}</h1>
				{filteredEntries.length < entries.length && <p className="italic text-xs">{entries.length - filteredEntries.length} items hidden due to filters.</p>}
			</div>
			<div className="max-h-96 min-h-96 overflow-y-scroll flex flex-col-reverse md:flex-row">
				<ul className="border-textColor md:border-r h-full">
					{filteredEntries.map(({ data }) => (
						<li key={data.url}>
							<a target="_blank" className="p-4 block w-full h-full border-b border-textColor no-underline cursor-pointer hover:brightness-150 hover:backdrop-brightness-125 will-change-auto" href={data.url}>
								<div className="w-full flex justify-between items-center">
									<h2 className="md:text-lg">{data.title}</h2>
									<div title={data.literacyLevel} className="flex items-center justify-end gap-1">
										{data.city != "All" && data.city != "Digital First" &&
											<h3 className="fill-textColor text-xs flex gap-1 items-center mr-1">
												<span>{(data.city).split(",")[0]} </span>
												<PiCityFill className="stroke-accentColor" />
											</h3>
										}
										<h3 className="text-xs hidden md:block">Complexity</h3>
										{[0, 1, 2, 3, 4].map(iconLevel => {
											if (iconLevel > parseInt(data.literacyLevel)) {
												return <FiMonitor key={iconLevel} size={12} className="stroke-textColor opacity-25" />
											} else {
												return <FiMonitor key={iconLevel} size={12} className="stroke-textColor" />
											}
										})}
									</div>
								</div>
								<h3 className="text-xs md:text-sm mb-2">{data.headline}</h3>
								<div className="flex gap-2 text-xs items-center">
									<h4>{data.category.map(text => toTitleCase(text)).join(", ")}</h4>
									<div className="h-4 border-l border-textColor"></div>
									<ul className="flex  gap-2">
										{data.pricing.map(tier => {
											if (tier === "free") {
												return <li key={tier} className="bg-yellow-400 text-bgColor px-1 h-min">Free</li>
											}
											if (tier === "paid") {
												return <li key={tier} className="bg-accentColor text-bgColor px-1 h-min">Paid</li>
											}
										})}
									</ul>
								</div>
							</a>
						</li>
					))}
				</ul>
				<form className="text-xs h-full border-b border-textColor md:border-b-0 md:sticky top-1/4 whitespace-nowrap p-4 flex flex-wrap items-center justify-center gap-2 min-w-48 flex-1 max-h-32 md:max-h-full">
					<div className="flex flex-col-reverse md:flex-row items-center gap-1">
						{/* TODO: figure out a way to align these without this ugly pixel-width */}
						<input className="h-[15.5px]" type="checkbox" {...register("freeOnly")} />
						<label htmlFor="freeOnly">Free Options Only</label>
					</div>
					<div className="flex flex-col-reverse md:flex-row items-center gap-1">
						<select {...register("maxComplexity")} className="text-bgColor">
							{["0", "1", "2", "3", "4"].map(level => (
								<option key={level} value={level}>{parseInt(level) + 1}</option>
							))}
						</select>
						<label htmlFor="maxComplexity">Max Complexity</label>
					</div>
					<div className="flex flex-col items-center gap-1">
						<label htmlFor="category">Category</label>
						<select {...register("category")} className="text-bgColor">
							{RecommendationCategories.map(category => (
								<option key={category} value={category}>{toTitleCase(category)}</option>
							))}
						</select>
					</div>
					<div className="flex flex-col items-center gap-1">
						<label htmlFor="city">City</label>
						<select {...register("city")} className="text-bgColor">
							{Cities.map(city => (
								<option key={city} value={city}>{city}</option>
							))}
						</select>
					</div>
					<button type="button" onPointerDown={resetFilters} className="p-4 py-2 bg-accentColor text-bgColor transition-all hover:brightness-125 h-min w-min whitespace-nowrap">{">: "}Reset Filters</button>
				</form>
			</div>
		</section>
	);
}
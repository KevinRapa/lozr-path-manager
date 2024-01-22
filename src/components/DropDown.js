
interface DropDownProps {
	ids: string[];
	idToNameMap: Record<string, string>;
	onChange: (selectedId: string) => void;
}

function convertIdsToIdNamePairs(ids: string[], idToNameMap: Record<string, string>): string[2][]
{
	return ids.map((id: string): string => {
		return [id, idToNameMap[id]];
	}).sort((p1: string[2], p2: string[2]): number => {
		return p1[1].localeCompare(p2[1]);
	});
}

export function DropDown(props: DropDownProps)
{
	const onChange = (e) => {
		console.log(`Clicked ${e.target.value}`);
		props.onChange(e.target.value);
	};

	let dropDownElems: string[2][] = convertIdsToIdNamePairs(props.ids, props.idToNameMap);

	return <select onChange={onChange}> {
		dropDownElems.map((s: string[2]): JSX.Element => {
			return <option key={s[0]} value={s[0]}>{s[1]}</option>;
		})
	} </select>;
}


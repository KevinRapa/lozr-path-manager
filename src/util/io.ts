
export function loadJson(onload: (e: any) => void)
{
	let input = document.createElement('input');

	input.type = 'file';
	input.onchange = (e) => {
		let file = e.target.files[0];
		let reader = new FileReader();

		reader.readAsText(file, 'UTF-8');
		reader.onload = onload;
	};
	input.click();
}

export function saveJson(saveData: string, name: string)
{
	const link = document.createElement("a");
	const file = new Blob([ saveData ], { type: 'text/plain' });

	link.href = URL.createObjectURL(file);
	link.download = name;
	link.click();
	URL.revokeObjectURL(link.href);
}

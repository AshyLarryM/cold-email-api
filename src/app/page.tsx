'use client';

import { useState } from "react";

export default function Home() {

	const [loading, setLoading] = useState<boolean>(false);
	const [contacts, setContacts] = useState<any[]>([]);

	async function startEmailGeneration() {
		setLoading(true);

		try {
			const res = await fetch("https://cold-email-api.vercel.app/api/googleSheets", {
				method: "GET",
			});
			const data = await res.json();
			console.log("API Response: ", data);
			setContacts(data.data);
		} catch (error) {
			console.error("Error calling API: ", error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col justify-center items-center h-screen">
			<button
				onClick={startEmailGeneration}
				disabled={loading}
				className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
			>
				{loading ? "Sending to Queue..." : "Send Contacts To Queue"}
			</button>

			{contacts.length > 0 && (
				<div className="w-full max-w-md mt-4">
					<h1 className="text-lg font-semibold mb-2 text-center">
						Contacts Sent to Queue
					</h1>
					<div className="border p-2 bg-gray-100 rounded max-h-60 overflow-auto">
						<ul className="text-sm space-y-2">
							{contacts.map((contact, index) => (
								<li key={index} className="border-b pb-2 last:border-b-0">
									<strong>Company:</strong> {contact.company} <br />
									<strong>Contact:</strong> {contact.contact} <br />
									<strong>Email:</strong> {contact.email}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
}

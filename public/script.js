document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {
        event.preventDefault();
        const userID = document.getElementById("userID").value;
        document.getElementById("password").value = md5(document.getElementById("password").value);
        const password = (document.getElementById("password").value);        
        const responseElement = document.getElementById("response");
        const form = document.getElementById("form");
        const result = document.getElementById("result");

        responseElement.classList.add("text-blue-500");
        responseElement.classList.remove("hidden");
        responseElement.textContent = "Logging in...";

        try {
            const response = await fetch("/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID, password }),
            });

            const data = await response.json();
            if (response.ok) {
                form.classList.add("hidden");
                result.classList.remove("hidden");
                dataResult(userID, data.role);
            } else {
                responseElement.textContent = `Error: ${data.error}`;
                responseElement.classList.add("text-red-500");
            }
        } catch (err) {
            responseElement.textContent = `Error: ${err.message}`;
            responseElement.classList.add("text-red-500");
        }
    });

async function dataResult(userID, role) {
    const dataResponse = document.getElementById("dataResponse");
    dataResponse.innerHTML = `<div class="text-center text-blue-700">Fetching Data.......</div>`;
    try {
        const response = await fetch(`/data?userID=${userID}&role=${role}`);
        const data = await response.json();
        if (response.ok) {
            let dataTable = data
                .map(
                    (element) =>
                        `<tr class="hover:bg-blue-50">
                <td class="px-4 py-2 border-b border-blue-200">${element.userid}</td>
                <td class="px-4 py-2 border-b border-blue-200">${element.password_hash}</td>
                <td class="px-4 py-2 border-b border-blue-200">${element.role}</td>
              </tr>`
                )
                .join("");
            dataResponse.innerHTML = `<table class="w-full text-left border border-blue-200 rounded-lg">
                <thead class="bg-blue-100">
                  <tr>
                    <th class="px-4 py-2 font-semibold text-blue-700 border-b border-blue-200">User Id</th>
                    <th class="px-4 py-2 font-semibold text-blue-700 border-b border-blue-200">Password Hash</th>
                    <th class="px-4 py-2 font-semibold text-blue-700 border-b border-blue-200">Role</th>
                  </tr>
                </thead>
                <tbody>${dataTable}</tbody>
              </table>`;
        } else {
            dataResponse.textContent = `Error: ${data.error}`;
        }
    } catch (err) {
        dataResponse.textContent = `Error: ${err.message}`;
    }
}

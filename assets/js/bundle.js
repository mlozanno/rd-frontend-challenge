(() => {
	// Utils
	const selector = (selector) => document.querySelector(selector);
	const create = (element) => document.createElement(element);

	// App
	const app = selector("#app");

	// Login
	const Login = create("div");

	Login.classList.add("login");

	// Logo
	const Logo = create("img");

	Logo.src = "./assets/images/logo.svg";
	Logo.classList.add("logo");

	// Form
	const Form = create("form");

	Form.onsubmit = async (e) => {
		e.preventDefault();

		const [email, password] = new FormData(Form);
		const { url } = await fakeAuthenticate(email.value, password.value);
		const users = await getDevelopersList(url);

		location.href = "#users";

		renderPageUsers(users);
	};

	Form.oninput = (e) => {
		const [email, password, button] = e.target.parentElement.children;

		!email.validity.valid || !email.value || password.value.length <= 5
			? button.setAttribute("disabled", "disabled")
			: button.removeAttribute("disabled");
	};

	Form.innerHTML = `
		<input type="email" id="email" name="email" placeholder="E-mail"/>

		<input type="password" id="password" name="password" placeholder="Senha"/>

		<button type="submit" id="button" disabled>Button
	`;

	Login.appendChild(Form);

	app.appendChild(Logo);
	app.appendChild(Login);

	const auth = {
		setToken: ({ token }) =>
			localStorage.setItem("token", JSON.stringify(token)),
		getToken: () => localStorage.getItem("token"),
	};

	async function fakeAuthenticate(email, password) {
		const response = await fetch(
			"http://www.mocky.io/v2/5dba690e3000008c00028eb6"
		);
		const data = await response.json();
		const fakeJwtToken = `${btoa(email + password)}.${btoa(data.url)}.${
			new Date().getTime() + 300000
		}`;

		auth.setToken({ token: fakeJwtToken });

		return data;
	}

	async function getDevelopersList(url) {
		const response = await fetch(url);
		return await response.json();
	}

	function renderPageUsers(users) {
		app.classList.add("logged");
		Login.style.display = "none";

		const devs = [];

		const Ul = create("ul");
		Ul.classList.add("container");

		users.map((user) =>
			devs.push(`
			<li class="user">
				<a href="${user.html_url}" target="_blank">
					<img src="${user.avatar_url}" alt="${user.login}" />
					${user.login}
				</a>
			</li>
		`)
		);

		Ul.innerHTML = devs.join("");

		app.appendChild(Ul);
	}

	//init
	(async function () {
		const rawToken = auth.getToken("token");

		const token = rawToken ? rawToken.split(".") : null;

		if (!token || token[2] < new Date().getTime()) {
			localStorage.removeItem("token");
			location.href = "#login";
			app.appendChild(Login);
		} else {
			location.href = "#users";
			const users = await getDevelopersList(atob(token[1]));
			renderPageUsers(users);
		}
	})();
})();

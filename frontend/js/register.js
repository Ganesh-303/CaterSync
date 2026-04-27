function toggleCatererFields(){
    const role = document.getElementById("role").value;
    document.getElementById("catererFields").style.display =
        role === "CATERER" ? "block" : "none";
}

async function register(){
    const payload ={
        name: name.value,
        email: email.value,
        password: password.value,
        role: role
    };
    //add caterer specific data only if role is caterer
    if (role ==="CATERER"){
        payload.catererProfile ={
            vegType: vegType.value,
            maxCapacity: capacity.value
        };
    }

    const res = await fetch(`${API_BASE_URL}/auth/register`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!res.ok){
        error.innerText = "Registration failed";
        return;
    }

    alert("Registration successful. Please login.");
    window.location.href = "login.html";
}
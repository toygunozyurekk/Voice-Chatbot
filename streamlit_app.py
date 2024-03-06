import streamlit as st
import requests

FLASK_API_URL = "http://127.0.0.1:5000/get_response"
def chatbot_app():
    st.title("Chatbot with OpenAI GPT-4")
    
    user_message = st.text_input("You:", "")

    if st.button("Send"):
        if user_message:
            # Update the URL to where your Flask app is running. 
            # If you're running Flask locally and it's listening on the default port (5000), the URL will be as below.
            url = FLASK_API_URL
            try:
                # Send the user message to the Flask API
                response = requests.post(url, json={"message": user_message})
                # Check if the request was successful
                if response.status_code == 200:
                    # Get the response message from Flask API and display it
                    response_message = response.json().get('response')
                    st.text_area("Chatbot:", value=response_message, height=100)
                else:
                    st.error("Failed to get response from the server.")
            except requests.exceptions.RequestException as e:
                st.error(f"Request failed: {e}")
        else:
            st.error("Please enter a message.")

if __name__ == "__main__":
    chatbot_app()

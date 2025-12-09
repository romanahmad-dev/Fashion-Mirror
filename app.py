import streamlit as st
from PIL import Image
import io
import base64
from datetime import datetime
from utils.api_handler import VirtualTryOnAPI
from utils.image_utils import resize_image, image_to_base64, validate_image, preprocess_image

st.set_page_config(
    page_title="Fashion Mirror - Virtual Try-On",
    page_icon="👗",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 1rem 0;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    .upload-section {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        border: 2px dashed #dee2e6;
        margin-bottom: 1rem;
    }
    .result-section {
        background-color: #e8f5e9;
        padding: 1.5rem;
        border-radius: 10px;
        margin-top: 1rem;
    }
    .stButton>button {
        width: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        font-size: 1.1rem;
        border-radius: 8px;
    }
    .stButton>button:hover {
        background: linear-gradient(90deg, #764ba2 0%, #667eea 100%);
    }
    .info-box {
        background-color: #e3f2fd;
        padding: 1rem;
        border-radius: 8px;
        border-left: 4px solid #2196f3;
        margin: 1rem 0;
    }
    .history-section {
        background-color: #f5f5f5;
        padding: 1.5rem;
        border-radius: 10px;
        margin-top: 1rem;
    }
    .history-item {
        background: white;
        padding: 0.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 0.5rem;
    }
    .comparison-view {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 1.5rem;
        border-radius: 10px;
        margin-top: 1rem;
    }
</style>
""", unsafe_allow_html=True)

if 'api_key' not in st.session_state:
    st.session_state.api_key = ""
if 'custom_url' not in st.session_state:
    st.session_state.custom_url = ""
if 'person_image' not in st.session_state:
    st.session_state.person_image = None
if 'clothing_image' not in st.session_state:
    st.session_state.clothing_image = None
if 'result_image' not in st.session_state:
    st.session_state.result_image = None
if 'processing' not in st.session_state:
    st.session_state.processing = False
if 'tryon_history' not in st.session_state:
    st.session_state.tryon_history = []
if 'selected_history_index' not in st.session_state:
    st.session_state.selected_history_index = None

with st.sidebar:
    st.header("⚙️ Configuration")
    
    st.subheader("API Settings")
    api_provider = st.selectbox(
        "Select API Provider",
        ["FASHN API", "Replicate", "Custom API"],
        help="Choose your virtual try-on API provider"
    )
    
    api_key = st.text_input(
        "API Key",
        type="password",
        value=st.session_state.api_key,
        help="Enter your API key for the selected provider"
    )
    
    custom_url = ""
    if api_provider == "Custom API":
        custom_url = st.text_input(
            "Custom API Endpoint",
            value=st.session_state.custom_url,
            placeholder="https://your-api.com/tryon",
            help="Enter the full URL of your custom virtual try-on API endpoint"
        )
        st.session_state.custom_url = custom_url
        
        if not custom_url:
            st.warning("Please enter your Custom API endpoint URL")
        elif not custom_url.startswith(("http://", "https://")):
            st.error("URL must start with http:// or https://")
    
    if api_key:
        st.session_state.api_key = api_key
        if api_provider != "Custom API" or (api_provider == "Custom API" and custom_url):
            st.success("API Key configured!")
    else:
        st.warning("Please enter your API key to use the virtual try-on feature")
    
    st.divider()
    
    st.subheader("🖼️ Image Preprocessing")
    st.caption("Optimize images before processing")
    
    remove_person_bg = st.checkbox(
        "Remove person background",
        value=False,
        help="Remove background from person image for better results"
    )
    
    remove_clothing_bg = st.checkbox(
        "Remove clothing background",
        value=False,
        help="Remove background from clothing image for cleaner try-on"
    )
    
    auto_crop_clothing = st.checkbox(
        "Auto-crop clothing",
        value=False,
        help="Automatically crop clothing image to remove excess whitespace"
    )
    
    st.divider()
    
    st.subheader("📋 Instructions")
    st.markdown("""
    1. **Configure API**: Enter your virtual try-on API key
    2. **Upload Person Image**: Upload a clear photo of a person
    3. **Upload Clothing**: Upload the clothing item to try on
    4. **Generate**: Click the button to see the result
    """)
    
    st.divider()
    
    st.subheader("ℹ️ About")
    st.markdown("""
    **Fashion Mirror**
    
    AI-Based Virtual Try-On System
    
    Final Year Project
    GC University, Faisalabad
    Session 2024-2026
    
    Supervisor: Dr. M. Umer Sarwar
    """)

st.markdown('<div class="main-header"><h1>👗 Fashion Mirror</h1><p>AI-Based Virtual Try-On System</p></div>', unsafe_allow_html=True)

col1, col2 = st.columns(2)

with col1:
    st.subheader("📷 Person Image")
    st.markdown('<div class="upload-section">', unsafe_allow_html=True)
    
    person_file = st.file_uploader(
        "Upload a clear photo of a person",
        type=['jpg', 'jpeg', 'png'],
        key="person_uploader",
        help="Upload a front-facing photo with the full upper body visible"
    )
    
    if person_file is not None:
        try:
            person_image = Image.open(person_file)
            is_valid, message = validate_image(person_image)
            if is_valid:
                st.session_state.person_image = person_image
                st.image(person_image, caption="Person Image", use_container_width=True)
            else:
                st.error(message)
                st.session_state.person_image = None
        except Exception as e:
            st.error(f"Error loading image: {str(e)}")
            st.session_state.person_image = None
    
    st.markdown('</div>', unsafe_allow_html=True)

with col2:
    st.subheader("👔 Clothing Image")
    st.markdown('<div class="upload-section">', unsafe_allow_html=True)
    
    clothing_file = st.file_uploader(
        "Upload a clothing item",
        type=['jpg', 'jpeg', 'png'],
        key="clothing_uploader",
        help="Upload a clear image of the clothing item (e.g., shirt, dress, jacket)"
    )
    
    if clothing_file is not None:
        try:
            clothing_image = Image.open(clothing_file)
            is_valid, message = validate_image(clothing_image)
            if is_valid:
                st.session_state.clothing_image = clothing_image
                st.image(clothing_image, caption="Clothing Item", use_container_width=True)
            else:
                st.error(message)
                st.session_state.clothing_image = None
        except Exception as e:
            st.error(f"Error loading image: {str(e)}")
            st.session_state.clothing_image = None
    
    st.markdown('</div>', unsafe_allow_html=True)

st.divider()

col_btn1, col_btn2, col_btn3 = st.columns([1, 2, 1])

custom_api_valid = api_provider != "Custom API" or (
    api_provider == "Custom API" and 
    st.session_state.custom_url and 
    st.session_state.custom_url.startswith(("http://", "https://"))
)

with col_btn2:
    generate_btn = st.button(
        "✨ Generate Virtual Try-On",
        disabled=(
            st.session_state.person_image is None or 
            st.session_state.clothing_image is None or 
            not st.session_state.api_key or
            not custom_api_valid
        ),
        use_container_width=True
    )

if generate_btn:
    if not st.session_state.api_key:
        st.error("Please configure your API key in the sidebar.")
    elif st.session_state.person_image is None:
        st.error("Please upload a person image.")
    elif st.session_state.clothing_image is None:
        st.error("Please upload a clothing image.")
    elif api_provider == "Custom API" and not st.session_state.custom_url:
        st.error("Please enter your Custom API endpoint URL in the sidebar.")
    else:
        with st.spinner("🔄 Processing your virtual try-on... This may take a moment."):
            try:
                api = VirtualTryOnAPI(
                    api_key=st.session_state.api_key,
                    provider=api_provider,
                    custom_url=st.session_state.custom_url if api_provider == "Custom API" else None
                )
                
                person_processed = st.session_state.person_image.copy()
                clothing_processed = st.session_state.clothing_image.copy()
                
                if remove_person_bg:
                    try:
                        with st.status("Removing person background...", expanded=False):
                            person_processed = preprocess_image(person_processed, remove_bg=True)
                    except Exception as e:
                        st.warning(f"Could not remove person background: {str(e)}. Using original image.")
                
                if remove_clothing_bg or auto_crop_clothing:
                    try:
                        with st.status("Processing clothing image...", expanded=False):
                            clothing_processed = preprocess_image(
                                clothing_processed, 
                                remove_bg=remove_clothing_bg, 
                                auto_crop=auto_crop_clothing
                            )
                    except Exception as e:
                        st.warning(f"Could not process clothing image: {str(e)}. Using original image.")
                
                person_resized = resize_image(person_processed, max_size=1024)
                clothing_resized = resize_image(clothing_processed, max_size=1024)
                
                result = api.generate_tryon(person_resized, clothing_resized)
                
                if result['success']:
                    result_img = result['image']
                    if isinstance(result_img, str):
                        from utils.image_utils import base64_to_image
                        result_img = base64_to_image(result_img)
                    if hasattr(result_img, 'copy'):
                        result_img_copy = result_img.copy()
                    else:
                        result_img_copy = result_img
                    
                    st.session_state.result_image = result_img
                    history_entry = {
                        'timestamp': datetime.now().strftime("%I:%M %p"),
                        'person_image': st.session_state.person_image.copy(),
                        'clothing_image': st.session_state.clothing_image.copy(),
                        'result_image': result_img_copy
                    }
                    st.session_state.tryon_history.insert(0, history_entry)
                    if len(st.session_state.tryon_history) > 10:
                        st.session_state.tryon_history = st.session_state.tryon_history[:10]
                    st.success("Virtual try-on generated successfully!")
                else:
                    st.error(f"Error: {result['error']}")
                    
            except Exception as e:
                st.error(f"An error occurred: {str(e)}")

if st.session_state.result_image is not None:
    st.markdown('<div class="result-section">', unsafe_allow_html=True)
    st.subheader("🎉 Virtual Try-On Result")
    
    col_r1, col_r2, col_r3 = st.columns([1, 2, 1])
    with col_r2:
        st.image(st.session_state.result_image, caption="Your Virtual Try-On Result", use_container_width=True)
        
        if isinstance(st.session_state.result_image, Image.Image):
            buf = io.BytesIO()
            st.session_state.result_image.save(buf, format='PNG')
            btn = st.download_button(
                label="📥 Download Result",
                data=buf.getvalue(),
                file_name="fashion_mirror_result.png",
                mime="image/png",
                use_container_width=True
            )
    
    st.markdown('</div>', unsafe_allow_html=True)

if st.session_state.tryon_history:
    st.divider()
    st.subheader("📜 Try-On History")
    st.caption(f"You have tried {len(st.session_state.tryon_history)} clothing item(s) this session")
    
    history_cols = st.columns(min(len(st.session_state.tryon_history), 5))
    
    for idx, entry in enumerate(st.session_state.tryon_history[:5]):
        with history_cols[idx]:
            st.image(entry['result_image'], caption=f"#{idx+1} - {entry['timestamp']}", use_container_width=True)
            if st.button(f"View", key=f"view_history_{idx}"):
                st.session_state.selected_history_index = idx
    
    if len(st.session_state.tryon_history) > 5:
        with st.expander(f"View more ({len(st.session_state.tryon_history) - 5} more items)"):
            more_cols = st.columns(min(len(st.session_state.tryon_history) - 5, 5))
            for idx, entry in enumerate(st.session_state.tryon_history[5:10]):
                actual_idx = idx + 5
                with more_cols[idx]:
                    st.image(entry['result_image'], caption=f"#{actual_idx+1} - {entry['timestamp']}", use_container_width=True)
                    if st.button(f"View", key=f"view_history_{actual_idx}"):
                        st.session_state.selected_history_index = actual_idx
    
    if st.session_state.selected_history_index is not None:
        selected = st.session_state.tryon_history[st.session_state.selected_history_index]
        st.markdown('<div class="comparison-view">', unsafe_allow_html=True)
        st.subheader(f"Viewing Try-On #{st.session_state.selected_history_index + 1}")
        
        comp_col1, comp_col2, comp_col3 = st.columns(3)
        with comp_col1:
            st.image(selected['person_image'], caption="Person", use_container_width=True)
        with comp_col2:
            st.image(selected['clothing_image'], caption="Clothing", use_container_width=True)
        with comp_col3:
            st.image(selected['result_image'], caption="Result", use_container_width=True)
            if isinstance(selected['result_image'], Image.Image):
                buf = io.BytesIO()
                selected['result_image'].save(buf, format='PNG')
                st.download_button(
                    label="📥 Download",
                    data=buf.getvalue(),
                    file_name=f"fashion_mirror_result_{st.session_state.selected_history_index + 1}.png",
                    mime="image/png",
                    use_container_width=True,
                    key=f"download_history_{st.session_state.selected_history_index}"
                )
        
        if st.button("Close View", key="close_history_view"):
            st.session_state.selected_history_index = None
            st.rerun()
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    col_clear1, col_clear2, col_clear3 = st.columns([1, 1, 1])
    with col_clear2:
        if st.button("🗑️ Clear History", use_container_width=True):
            st.session_state.tryon_history = []
            st.session_state.selected_history_index = None
            st.rerun()

st.divider()

with st.expander("📚 How It Works"):
    st.markdown("""
    ### Fashion Mirror - AI Virtual Try-On Technology
    
    Our system uses advanced AI algorithms to create realistic virtual try-on experiences:
    
    1. **Image Analysis**: The AI analyzes the person's photo to understand body shape and pose
    2. **Clothing Processing**: The clothing item is processed to understand its shape and design
    3. **AI Overlay**: Using deep learning, the clothing is realistically overlaid on the person
    4. **Result Generation**: A photorealistic result is generated showing the virtual try-on
    
    #### Tips for Best Results:
    - Use clear, well-lit photos
    - Ensure the person is facing the camera
    - Use clothing images with plain backgrounds
    - Higher resolution images produce better results
    """)

with st.expander("❓ Frequently Asked Questions"):
    st.markdown("""
    **Q: What types of clothing work best?**
    A: Upper body garments like shirts, t-shirts, dresses, and jackets work best.
    
    **Q: How long does processing take?**
    A: Processing typically takes 10-30 seconds depending on image complexity.
    
    **Q: Can I use this commercially?**
    A: Please check the terms of service of your chosen API provider.
    
    **Q: What image formats are supported?**
    A: We support JPG, JPEG, and PNG formats.
    """)

st.markdown("""
---
<div style="text-align: center; color: #666; padding: 1rem;">
    <p>Fashion Mirror - AI Virtual Try-On System</p>
    <p>Government College University, Faisalabad | Session 2024-2026</p>
</div>
""", unsafe_allow_html=True)

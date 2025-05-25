use core::ffi::c_char;
use std::collections::BTreeMap;
use std::sync::{Mutex, OnceLock};

#[cfg(target_arch = "wasm32")]
pub fn mem_allocated_to_c() -> &'static Mutex<BTreeMap<usize, Vec<c_char>>> {
    static MEMORY: OnceLock<Mutex<BTreeMap<usize, Vec<c_char>>>> = OnceLock::new();
    MEMORY.get_or_init(|| Mutex::new(BTreeMap::new()))
}

#[cfg(target_arch = "wasm32")]
use crate::wasm_bindgen;

#[cfg(target_arch = "wasm32")]
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[cfg(target_arch = "wasm32")]
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(a: &str);
}

// void abort(void); // https://en.cppreference.com/w/c/program/abort
#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn __assert_fail(_: *const i32, _: *const i32, _: *const i32, _: *const i32) {
    panic!();
}

// int fclose( FILE *stream ); // https://en.cppreference.com/w/c/io/fclose
#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn fclose() {
    panic!();
}

// FILE *fdopen(int fd, const char *mode); // https://linux.die.net/man/3/fdopen
#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn fdopen() {
    panic!();
}

#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn fwrite() {
    panic!();
}

// int printf( const char*          format, ... ); // https://en.cppreference.com/w/c/io/fprintf
#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn fprintf() {
    panic!();
}

// int fputs( const char *str, FILE *stream ); // https://en.cppreference.com/w/c/io/fputs
//on success, returns a non-negative value
#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn fputs() {
    panic!();
}

// int fputc( int ch, FILE* stream ); // https://en.cppreference.com/w/c/io/fputc
#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn fputc(ch: i32, _: usize) {
    panic!();
}

// int snprintf( char* restrict buffer, size_t bufsz, const char* restrict format, ... );
#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn snprintf() {
    panic!();
}

// int snprintf( char* restrict buffer, size_t bufsz, const char* restrict format, ... );
#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn sprintf() {
    panic!();
}

#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn abort() {
    // void abort(void); // https://en.cppreference.com/w/c/program/abort
    panic!();
}

#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn calloc(num: usize, size: usize) -> *mut c_char {
    let aligned_size = (size + 3) & !3usize; // round up to a multiple of 4
    let total_size = num * aligned_size;

    let mut memory = Vec::<c_char>::with_capacity(total_size);

    // calloc should zero the memory, malloc and realloc don't need to (but do, so rust knows we're using it)
    let mut i = 0;
    while i < total_size {
        memory.push(0);
        i += 1;
    }

    let ptr: *mut c_char = memory.as_mut_ptr();

    let addr: usize = ptr as usize;
    mem_allocated_to_c()
        .lock()
        .expect("Unable to get lock on C memory table in calloc")
        .insert(addr, memory);

    ptr
}

// void free( void *ptr ); // https://en.cppreference.com/w/c/memory/free
#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn free(ptr: *mut c_char) {
    match mem_allocated_to_c()
        .lock()
        .expect("Unable to get lock on C memory table in `free`")
        .remove(&(ptr as usize))
    {
        Some(_) => (),
        None => console_log!("attempt to free unallocated memory {}", (ptr as usize)),
    }
}

#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn malloc(size: usize) -> *mut c_char {
    let mut memory = Vec::<c_char>::with_capacity(size);

    // libc doesn't zero malloc'd memory, but we do so rust knows we're using it
    let mut i = 0;
    while i < size {
        memory.push(0);
        i += 1;
    }

    let ptr: *mut c_char = memory.as_mut_ptr();

    let addr: usize = ptr as usize;
    mem_allocated_to_c()
        .lock()
        .expect("Unable to get lock on C memory table during malloc")
        .insert(addr, memory);

    ptr
}

#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn realloc(ptr: *mut c_char, new_size: usize) -> *mut c_char {
    if new_size == 0 {
        console_log!("realloc zero size")
        // not sure what to do about this
    }
    if 0 == (ptr as usize) {
        console_log!("realloc called with 0 ptr");
        // not sure what to do here, as mem location 0 is valid in wasm aiui but used as a request for a new allocation in nativ libc
        return malloc(new_size);
    }

    let mut memory_store = mem_allocated_to_c()
        .lock()
        .expect("Unable to get lock on C memory table during realloc");

    match memory_store.remove(&(ptr as usize)) {
        Some(mut memory) => {
            memory.resize(new_size, 0);
            let new_ptr: *mut c_char = memory.as_mut_ptr();

            let addr: usize = new_ptr as usize;
            memory_store.insert(addr, memory);

            return new_ptr;
        }
        None => return ptr,
    }
}

#[cfg(target_arch = "wasm32")]
#[unsafe(no_mangle)]
pub extern "C" fn clock_gettime(ptr: usize, new_size: usize) {
    panic!();
}
